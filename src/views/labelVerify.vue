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
                <el-select v-model="selectValue" filterable placeholder="请选择label" @change="labelChange">
                    <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
                    </el-option>
                </el-select>
            </div>
        </div>
        <br>
        <div style="overflow: auto; height: calc(100vh - 120px);">
            <div @click="openWindow({
                name: 'labelMain', params: {
                    dataset: label.dataset_id,
                    offset: 0,
                    id: label.image_id,
                    only: '1'
                }
            })" v-for="label in labels" :class="['img-box']">
                <img :src="`/api/file/get/label?id=${label.image_id}&left=${label.left}&top=${label.top}&width=${label.width}&height=${label.height}&`"
                    style="height: 100px;max-width: 100%">
            </div>
        </div>
    </div>
</template>

<script>
import { Button, Select } from 'element-ui';
import { getDataset, getLabels } from '@/api/api'
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
            currentPage: 1,
            pageSize: 500,
            total: 0,
            dataset: {},
            labels: [],
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
        this.currentPage = (this.offset / this.pageSize) + 1

        this.getDataset()
        this.getLabels()
        this.$nextTick(() => {
            setTimeout(() => {
                this.loading = false
            }, 500)
        });
    },
    methods: {
        openWindow(to) {
            const routeData = this.$router.resolve(to)
            window.open(routeData.href, '_blank')
        },
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
        getLabels() {
            this.labels = []
            getLabels({
                ds: this.$route.params.dataset,
                label: this.selectValue,
                pageSize: this.pageSize,
                offset: this.offset
            }).then(res => {
                this.labels = res.data.rows
                this.total = res.data.total
            }).catch(err => {
                this.$message.error(err.response.data.error)
            })
        },
        handlePageChange(val) {
            this.offset = (val - 1) * this.pageSize
            this.currentPage = val
            this.getLabels()
        },
        labelChange(val) {
            this.offset = 0
            this.currentPage = 1
            this.getLabels()
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
    width: 100px;
    float: left;
}

.img-box:hover {
    border-color: #0097dd;
    background: #0097dd;
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