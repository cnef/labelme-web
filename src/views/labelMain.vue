<template>
    <div>
        <div style="text-align: center">
            <el-button class="el-button--primary" @click="exportImg">导出</el-button>
        </div>
        <br>
        <el-row :gutter="20" style="height: calc(100vh - 120px);">
            <el-col :span='3'>
                <div style="height: 100%;overflow: auto;">
                    <div @click="getImgInfo(i)" :class="['img-box', { 'img-box-active': true }]">
                        <img src="../assets/img/kotei_9628.png" style="max-height: 200px;max-width: 100%">
                    </div>
                    <div @click="getImgInfo(i)" :class="['img-box', { 'img-box-active': true }]">
                        <img src="../assets/img/kotei_9640.png" style="max-height: 200px;max-width: 100%">
                    </div>
                    <div @click="getImgInfo(i)" :class="['img-box', { 'img-box-active': true }]">
                        <img src="../assets/img/kotei_10015.png" style="max-height: 200px;max-width: 100%">
                    </div>
                    <div style="text-align: center">
                        <a class="more-a" @click="getMore">点击加载更多</a>
                    </div>
                </div>
            </el-col>
            <el-col :span='17'>
                <div v-loading="loading" id="canvas-box" style="">
                    <canvas id="label-canvas" style="display: block;width: 100%;height:100%"></canvas>
                    <img id="img-test" src="../assets/img/kotei_9628.png" style="max-width: 100%;display: none">
                </div>
            </el-col>
            <el-col :span='4'>
                <div class="result-box">
                    <div class="result-tittle" style="">标注结果</div>
                    <div class="result-content">
                        <!-- <div v-for="(val, key) in labelResult[activeIndex]" class="result-item">
                            <b>{{ activeIndex }}-{{ key }}</b>
                            <div class="result-sub-box" v-for="(item, i) in val">
                                <div>
                                    <i>{{ i }}{{ item.shape }}</i>
                                </div>
                                <div class="result-sub-box-icon">
                                    <span title="编辑" @click="handleCommand('edit', item.id, key)" style="cursor: pointer"
                                        class="el-icon-edit-outline"></span>
                                    <span style="padding-right: 10px"></span>
                                    <span title="删除" @click="handleCommand('delete', item.id, key)" style="cursor: pointer"
                                        class="el-icon-delete"></span>
                                </div>
                            </div>
                        </div> -->
                    </div>
                </div>
            </el-col>
        </el-row>
        <div ref="toolTip" class="toolTip">
            <el-select v-model="selectValue" filterable placeholder="请选择" @change="topChange">
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

import './label.js';

export default {
    name: 'labelMain',
    components: {
        Button,
        Select
    },
    data() {
        return {
            options: [{
                value: '选项1',
                label: 'char-1'
            }, {
                value: '选项2',
                label: 'char-2'
            }, {
                value: '选项3',
                label: 'dot-1'
            }, {
                value: '选项4',
                label: 'dot-2'
            }, {
                value: '选项5',
                label: '北京烤鸭'
            }],
            selectValue: "",
            loading: true,
            fabricObj: null,
            mouseFrom: {},
            mouseTo: {},
            doDrawing: false,
            page: 1,
            pageSize: 4,
            imgList: [
                { index: 0, url: '' },
                { index: 1, url: '' },
                { index: 2, url: '' },
                { index: 4, url: '' },
            ],
            labelResult: {
                // 0:{'renche3.5':['juxing0']}
            },
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
        this.$nextTick(() => {
            setTimeout(() => {
                this.loading = false;
                this.fabricCanvas();
                this.fabricObjEvent();
            }, 500)
        });

    },
    methods: {
        topChange(v) {
            console.log(v)
            var a = this.fabricObj.getActiveObject()
            console.log(a)
            if (a) {
                a.set({
                    "label": v,
                    dirty: true
                })
                this.fabricObj.requestRenderAll()
                this.closeTip()
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
        /**
        * @desc 初始化fabric，添加图待标注图片到画布中。
        * */
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
            });

            let imgElement = document.getElementById('img-test');
            let imgWidth = imgElement.naturalWidth;
            let imgHeight = imgElement.naturalHeight;
            let scale;

            if (imgWidth / imgHeight > canvasWidth / canvasHeight) {
                scale = canvasWidth / imgWidth;
            } else {
                scale = canvasHeight / imgHeight
            }
            let img = new fabric.Image(imgElement, {
                scaleX: scale,
                scaleY: scale,
                zIndex: 0,
                selectable: false,
            });

            this.fabricObj.add(
                img,
            );

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
        /**
         * @desc事件监听
         * */
        fabricObjEvent() {
            // this.fabricObj.isDrawingMode = true;
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
            if (this.drawingObject) {
                this.fabricObj.remove(this.drawingObject)
            }

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
            let fabricNew = new fabric.LabeledRect({
                width: width,
                height: height,
                left: x,
                top: y,
                label: 'test',
                fill: "rgba(255, 255, 255, 0.5)",
                stroke: '#357960',
                strokeWidth: 1,

                hasRotatingPoint: false,
                centeredRotation: false,
                lockRotation: true
            });

            fabricNew.on('mousedown', (event) => {
                if (event.button === 1) {
                    console.log("left click");
                    var ps = this.getObjPosition(event)
                    console.log(ps)
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
            })

            if (fabricNew) {
                this.fabricObj.add(fabricNew);
            }

        },
      
        exportImg() {
            console.log(this.fabricObj.toJSON())
        },

        /*
       * @desc 获取更所图片
       * */
        getMore() {
            for (let i = 0; i < this.pageSize; i++) {
                this.imgList.push({ index: this.pageSize * this.page + i, url: '' })
            }
            this.page++;
        },
        /*
        * @desc 获取当前图片信息
        * */
        getImgInfo(i) {
            this.activeIndex = i;
            // this.fabricJson[i-1] = JSON.stringify(this.fabricObj);
            this.fabricObj.clear().renderAll();
            this.fabricCanvas();
            if (this.fabricJson.hasOwnProperty(i + '') && this.fabricJson[i + ''] !== '') {
                // console.log(this.fabricJson[i+'']);
                this.fabricObj.loadFromJSON(this.fabricJson[i + ''])
                this.fabricObj.renderAll();
            }
        },
    },
}
</script>

<style scoped>
.pre-text {
    padding-right: 5px
}

.more-a {
    color: #0097dd;
    cursor: pointer;
    text-decoration: underline;
}

.img-box {
    border: 1px solid #dddeea;
    margin-bottom: 10px;
    cursor: pointer;
}

.img-box:hover {
    border-color: #0097dd;
}

.img-box-active {
    border-color: #0097dd;
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
</style>