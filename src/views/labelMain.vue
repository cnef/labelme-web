<template>
    <div>
        <div class="header">
            <div class="title">
                <strong style="padding: 0 10px;">数据集：{{ dataset.name }} (图片数：{{ dataset.count }})</strong>
            </div>
            <div class="pages">
                <el-pagination background layout="prev, pager, next, jumper" :current-page.sync="currentPage" :total="total"
                    :page-size="pageSize" @current-change="handlePageChange">
                </el-pagination>
            </div>
            <div class="btn">
                <el-button type="primary" @click="detectImage">自动识别</el-button>
                <el-button type="primary" @click="copyLabels">复制</el-button>
                <el-button type="primary" @click="saveImg">保存</el-button>
                <el-button type="danger" @click="deleteImage" style="margin-left: 30px;">删除</el-button>
                <el-button type="danger" @click="resetImages">清空</el-button>
            </div>
            <div class="help">
                <p>鼠标中间缩放，按住 Alt 可移动图片</p>
            </div>
        </div>
        <br>
        <el-row :gutter="20" style="height: calc(100vh - 120px);">
            <el-col :span='3'>
                <div style="overflow: auto;">
                    <div @click="switchImage(img.id)" v-for="img in images"
                        :class="['img-box', { 'img-box-active': img.id == activeImgId }]">
                        <div class="img-label">
                            {{ img.id }}
                        </div>
                        <img :src="'/api/file/get?id=' + img.id" style="height: 100px;max-width: 100%">
                    </div>
                </div>
            </el-col>
            <el-col :span='21'>
                <div v-loading="loading" id="canvas-box" style="">
                    <canvas id="label-canvas" style="display: block;width: 100%;height:100%"></canvas>
                    <img id="labelImg" @load="imageLoaded" :src="'/api/file/get?id=' + activeImgId"
                        style="max-width: 100%;display: none">
                </div>
            </el-col>
        </el-row>
        <div ref="toolTip" class="toolTip">
            <el-select v-model="selectValue" filterable placeholder="请选择" @change="labelChange">
                <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
            </el-select>
            <div style="padding: 5px;">
                <el-button @click="deleteObj()">删除</el-button>
                <el-button type="primary" @click="closeTip()">关闭</el-button>
            </div>
        </div>
    </div>
</template>

<script>
import { Button, Select } from 'element-ui';
import { getDataset, getImages, updateImage, getImage, deleteImage, detectImage } from '@/api/api'
import './label.js';

export default {
    name: 'labelMain',
    components: {
        Button,
        Select
    },
    data() {
        return {
            options: [],
            selectValue: "",
            loading: true,
            fabricObj: null,
            mouseFrom: {},
            mouseTo: {},
            doDrawing: false,
            saved: true,
            currentPage: 1,
            pageSize: 6,
            total: 0,
            dataset: {},
            images: [],
            activeImgId: "",
        }
    },
    watch: {
    },
    computed: {
    },
    beforeCreate() {
        this.loading = true;
    },
    mounted() {
        this.offset = this.$route.params.offset
        this.getDataset()
        this.getImages()
        this.$nextTick(() => {
            setTimeout(() => {
                this.fabricCanvas();
                this.fabricObjEvent();
                this.addImageToCanvas()

                // this.fabricObj.loadFromJSON(this.fabricJson[id + ''])
                this.currentPage = (this.offset / this.pageSize) + 1
                this.loading = false
            }, 500)
        });
    },
    methods: {
        getDataset() {
            getDataset({ id: this.$route.params.dataset })
                .then(res => {
                    this.dataset = res.data
                    var opts = []
                    res.data.labels.forEach(v => {
                        if (v != "") {
                            opts.push({
                                label: v,
                                value: v
                            })
                        }
                    })
                    this.options = opts
                }).catch(err => {
                    this.$message.error(err.response.data.error)
                })
        },
        getImages() {
            getImages({ ds: this.$route.params.dataset, pageSize: this.pageSize, offset: this.offset })
                .then(res => {
                    this.images = res.data.rows
                    this.total = res.data.total
                    this.activeImgId = this.$route.params.id
                    if (this.activeImgId == 0 && this.images.length > 0) {
                        this.activeImgId = this.images[0].id
                    }
                }).catch(err => {
                    this.$message.error(err.response.data.error)
                })
        },
        handlePageChange(val) {
            if (!this.checkSave()) {
                this.currentPage = this.currentPage
                return
            }
            this.offset = (val - 1) * this.pageSize
            this.activeImgId = 0
            this.currentPage = val
            this.switchImage(0)
            this.getImages()
        },
        checkSave() {
            if (!this.saved) {
                if (!confirm("还未保存，要放弃吗")) {
                    return false
                }
                this.saved = true
            }
            return true
        },
        switchImage(imageId) {
            if (!this.checkSave()) {
                return
            }
            if (this.activeImgId == imageId && this.activeImgId > 0) {
                return
            }
            this.activeImgId = imageId
            this.$router.push({
                name: 'labelMain',
                params: {
                    dataset: this.$route.params.dataset,
                    offset: this.offset,
                    id: imageId
                }
            });
        },
        labelChange(v) {
            var a = this.fabricObj.getActiveObject()
            if (a) {
                a.set({
                    "label": v,
                    dirty: true
                })
                this.fabricObj.requestRenderAll()
                this.closeTip()
                this.saved = false
            }
        },
        closeTip() {
            this.$refs.toolTip.style.visibility = 'hidden'
        },
        deleteObj() {
            var obj = this.fabricObj.getActiveObject()
            this.fabricObj.remove(obj);
            this.closeTip()
        },
        deleteImage() {
            if (confirm("确定删除当前图片?")) {
                deleteImage({ id: parseInt(this.activeImgId) }).then(res => {
                    this.$message.success("删除成功")
                    this.getImages()
                }).catch(err => {
                    this.$message.error(err.response.data.error)
                })
            }
        },
        fabricCanvas() {
            let canvasBox = document.getElementById('canvas-box');
            let canvasWidth = canvasBox.clientWidth || canvasBox.offsetWidth;
            let canvasHeight = canvasBox.clientHeight || canvasBox.offsetHeight;
            document.getElementById('label-canvas').width = canvasWidth;
            document.getElementById('label-canvas').height = canvasHeight;

            this.fabricObj = new fabric.Canvas('label-canvas', {
                fireRightClick: true,  // <-- enable firing of right click events
                fireMiddleClick: true, // <-- enable firing of middle click events
                stopContextMenu: true, // <--  prevent context menu from showing
                hoverCursor: 'pointer',
            });
        },
        addImageToCanvas(disableLabels) {
            if (!this.fabricObj) {
                return
            }

            this.fabricObj.clear()
            let canvasBox = document.getElementById('canvas-box');
            let canvasWidth = canvasBox.clientWidth || canvasBox.offsetWidth;
            let canvasHeight = canvasBox.clientHeight || canvasBox.offsetHeight;

            let imgElement = document.getElementById('labelImg');
            let imgWidth = imgElement.naturalWidth;
            let imgHeight = imgElement.naturalHeight;
            let scale;

            if (imgWidth / imgHeight > canvasWidth / canvasHeight) {
                scale = canvasWidth / imgWidth;
            } else {
                scale = canvasHeight / imgHeight
            }
            let activeImg = new fabric.Image(imgElement, {
                // scaleX: scale,
                // scaleY: scale,
                zIndex: 0,
                selectable: false,
            });

            this.fabricObj.add(activeImg);
            this.fabricObj.setZoom(scale)

            if (!disableLabels) {
                getImage({ id: this.activeImgId }).then(res => {
                    if (res.data.labels == "")
                        return
                    var labels = JSON.parse(res.data.labels)
                    labels.forEach(v => {
                        this.createRect(v.left, v.top, v.width, v.height, v.label)
                    })
                }).catch(err => {
                    this.$message.error(err.response.data.error)
                })
            }
            this.fabricObj.requestRenderAll();
        },
        getObjPosition(e) {
            // Get dimensions of object
            var rect = e.target.getBoundingRect();
            // We have the bounding box for rect... Now to get the canvas position
            var offset = this.fabricObj.calcOffset();
            // Do the math - offset is from $(body)
            var bottom = offset._offset.top + rect.top + rect.height;
            var right = offset._offset.left + rect.left + rect.width;
            var left = offset._offset.left + rect.left;
            var top = offset._offset.top + rect.top;
            return { left: left, top: top, right: right, bottom: bottom };
        },
        copyLabels() {
            var from = prompt("源 id")
            if (!from) return
            getImage({ id: from }).then(res => {
                if (res.data.labels == "")
                    return
                var labels = JSON.parse(res.data.labels)
                labels.forEach(v => {
                    this.createRect(v.left, v.top, v.width, v.height, v.label)
                })
            }).catch(err => {
                this.$message.error(err.response.data.error)
            })
            this.fabricObj.requestRenderAll();
        },
        detectImage() {
            detectImage({ id: this.activeImgId }).then(res => {
                console.log(res.data)
                console.log("zoom", this.fabricObj.getZoom())
                res.data.forEach(([x1, y1, x2, y2, label, rate]) => {
                    this.createRect(x1, y1, x2 - x1, y2 - y1, label)
                });
            }).catch(err => {
                this.$message.error(err.response.data.error)
            })
            this.fabricObj.requestRenderAll();
        },
        fabricObjEvent() {
            console.log('fabricObjEvent')
            this.fabricObj.on({
                'mouse:down': (e) => {
                    //鼠标按下
                    console.log('mouse down')
                    var evt = e.e;
                    // 缩放，拖拽
                    if (evt.altKey === true) {
                        this.fabricObj.isDragging = true;
                        this.fabricObj.selection = false;
                        this.fabricObj.lastPosX = evt.clientX;
                        this.fabricObj.lastPosY = evt.clientY;
                        return
                    }
                    var pointer = this.fabricObj.getPointer(e.e);

                    this.mouseFrom.x = pointer.x;
                    this.mouseFrom.y = pointer.y;
                    this.doDrawing = true;

                },
                'selection:cleared': (e) => {
                    console.log("selection cleared")
                    this.closeTip()
                },
                'mouse:move': (e) => {
                    if (this.fabricObj.isDragging) {
                        var e = e.e;
                        var vpt = this.fabricObj.viewportTransform;
                        vpt[4] += e.clientX - this.fabricObj.lastPosX;
                        vpt[5] += e.clientY - this.fabricObj.lastPosY;
                        this.fabricObj.requestRenderAll();
                        this.fabricObj.lastPosX = e.clientX;
                        this.fabricObj.lastPosY = e.clientY;
                        return
                    }

                    if (!this.doDrawing) {
                        return
                    }
                    var pointer = this.fabricObj.getPointer(e.e);
                    this.mouseTo.x = pointer.x;
                    this.mouseTo.y = pointer.y;
                },
                'mouse:up': (e) => {
                    if (this.fabricObj.isDragging) {
                        // on mouse up we want to recalculate new interaction
                        // for all objects, so we call setViewportTransform
                        this.fabricObj.setViewportTransform(this.fabricObj.viewportTransform);
                        this.fabricObj.isDragging = false;
                        this.fabricObj.selection = true;
                        console.log('dragged')
                        return
                    }

                    if (!this.doDrawing) {
                        return
                    }

                    var pointer = this.fabricObj.getPointer(e.e);

                    this.mouseTo.x = pointer.x;
                    this.mouseTo.y = pointer.y;
                    this.drawing()
                    this.doDrawing = false;
                },
                'object:moving': (e) => {
                    //对象移动
                    // console.log('object:moving')
                    this.doDrawing = false;
                },
                'object:scaling': (e) => {
                    this.doDrawing = false
                },
                'mouse:wheel': (opt) => {
                    var delta = opt.e.deltaY;
                    var zoom = this.fabricObj.getZoom();
                    zoom *= 0.999 ** delta;
                    if (zoom > 20) zoom = 20;
                    if (zoom < 0.01) zoom = 0.01;
                    this.fabricObj.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
                    opt.e.preventDefault();
                    opt.e.stopPropagation();
                },
            })
        },

        drawing() {
            let width = Math.abs(this.mouseTo.x - this.mouseFrom.x)
            let height = Math.abs(this.mouseTo.y - this.mouseFrom.y)
            if (width < 10 || height < 10) {
                return
            }
            let x = this.mouseFrom.x
            let y = this.mouseFrom.y
            if (this.mouseTo.x < this.mouseFrom.x) {
                x = this.mouseTo.x
            }
            if (this.mouseTo.y < this.mouseFrom.y) {
                y = this.mouseTo.y
            }
            this.createRect(x, y, width, height, "")
        },
        createRect(left, top, width, height, label) {
            let fabricNew = new fabric.LabeledRect({
                width: width,
                height: height,
                left: left,
                top: top,
                label: label,
                fill: "rgb(26, 115, 232, 0.5)",
                stroke: 'rgb(26, 115, 232)',
                strokeWidth: 1,

                hasRotatingPoint: false,
                centeredRotation: false,
                lockRotation: true,
                selectable: true,
            });

            fabricNew.on('mousedown', (event) => {
                if (event.button === 1) {
                    console.log("left click");
                    var ps = this.getObjPosition(event)
                    console.log(ps)
                    this.selectValue = fabricNew.get("label")
                    this.$refs.toolTip.style.visibility = 'visible'
                    this.$refs.toolTip.style.top = ps.top + 'px'
                    this.$refs.toolTip.style.left = ps.right + 'px'
                }
                if (event.button === 2) {
                    console.log("middle click");
                }
                if (event.button === 3) {
                    console.log("right click");
                }
                console.log("draw click");
            })

            if (fabricNew) {
                this.fabricObj.add(fabricNew);
            }
        },
        saveImg() {
            var obj = this.fabricObj.toJSON()
            var labels = []
            console.log(obj)
            for (var i = 0; i < obj.objects.length; i++) {
                var v = obj.objects[i]
                if (v.type == "labeledRect") {
                    if (v.label == "") {
                        this.$message.warning("存在未设置 label 的标签")
                        labels = []
                        return
                    }
                    labels.push(
                        {
                            type: "rect",
                            label: v.label,
                            left: v.left,
                            top: v.top,
                            width: v.width * v.scaleX,
                            height: v.height * v.scaleY,
                        }
                    )
                }
            }

            updateImage({
                id: parseInt(this.activeImgId),
                labels: JSON.stringify(labels),
                width: obj.objects[0].width,
                height: obj.objects[0].height
            }).then(res => {
                this.$message.success("保存成功")
                this.saved = true
            }).catch(err => {
                this.$message.error(err.response.data.error)
            })
            console.log(obj, labels)
        },

        imageLoaded() {
            console.log("imageLoaded")
            this.addImageToCanvas()
        },

        resetImages() {
            if (confirm("确定清空当前标记?")) {
                this.addImageToCanvas(true)
            }
        }
    },
}
</script>

<style scoped>
.pre-text {
    padding-right: 5px
}

.img-box {
    border: 1px solid #dddeea;
    margin-bottom: 10px;
    cursor: pointer;
    text-align: center;
}

.img-box:hover {
    border-color: #0097dd;
}

.img-box-active {
    border-color: #0097dd;
}

.img-box .img-label {
    position: absolute;
    width: 40px;
    height: 16px;
    font-size: 14px;
    background: #fff;
    text-align: center;
}

#canvas-box {
    border: 1px solid #dddeea;
    height: 100%;
    position: relative;
    height: calc(100vh - 130px);
    width: 100%;
    overflow: hidden;
}

.result-tittle {
    border-left: 4px solid #409EFF;
    padding-left: 10px;
    border-bottom: 1px solid #dddeea;
}

.result-content {
    padding: 10px;
}

.result-item {
    margin-bottom: 10px;
}

.result-sub-box {
    padding-left: 10px;
    display: flex;
    justify-content: space-between
}

.result-sub-box:hover {
    color: #409EFF;
}

.toolTip {
    position: absolute;
    z-index: 1;
    background: #fff;
    border: 1px solid #ccc;
    /* height: 30px; */
    width: 120px;
    padding: 8px;
    font-size: 13px;
    color: #fff;
    visibility: hidden;
}

.header {
    text-align: center;
}

.header .title,
.header .btn,
.header .pages,
.header .help {
    display: inline-block;
    margin: 0 10px;
}
</style>