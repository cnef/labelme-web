<template>
    <el-drawer title="编辑数据集" :visible.sync="dialog" direction="rtl" custom-class="demo-drawer">
        <div class="demo-drawer__content">
            <el-form :model="form">
                <el-form-item label="ID" :label-width="formLabelWidth">
                    <el-input v-model="form.id" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="说明" :label-width="formLabelWidth">
                    <el-input v-model="form.name" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="模型文件" :label-width="formLabelWidth">
                    <el-input v-model="form.model_path" autocomplete="off"></el-input>
                    <el-upload ref="up" class="upload-demo" action="/api/file/upload" :limit="1" :on-success="handleSuccess"
                        :data="{ dir: 'models' }">
                        <el-button size="small" type="primary">点击上传</el-button>
                        <div slot="tip" class="el-upload__tip">只能上传 onnx 文件</div>
                    </el-upload>
                </el-form-item>
                <el-form-item label="Input Shape" :label-width="formLabelWidth">
                    <el-input placeholder="1,3,640,640" v-model="form.input_shape">
                    </el-input>
                </el-form-item>
                <el-form-item label="Output Shape" :label-width="formLabelWidth">
                    <el-input placeholder="1,31,8400" v-model="form.output_shape">
                    </el-input>
                </el-form-item>
                <el-form-item label="置信度阈值" :label-width="formLabelWidth">
                    <el-input placeholder="0.1" v-model="form.probability">
                    </el-input>
                </el-form-item>
                <el-form-item label="标签定义" :label-width="formLabelWidth">
                    <el-input type="textarea" :rows="10" placeholder="一行一个" v-model="form.labels">
                    </el-input>
                </el-form-item>
            </el-form>
            <div class="demo-drawer__footer">
                <el-button @click="closeForm">取消</el-button>
                <el-button @click="handleOk" type="primary" :loading="loading">{{ loading ? '提交中 ...' :
                    '确定'
                }}</el-button>
            </div>
        </div>
    </el-drawer>
</template>

<script>
import { updateDataset, createDataset } from '@/api/api'

export default {
    name: "dataset",
    methods: {
        show(data) {
            this.dialog = true
            this.$nextTick(() => {
                this.$refs.up.clearFiles()
            })
            if (data) {
                this.edit = true
                var d = Object.assign({}, data)
                d.labels = d.labels.join("\n")
                this.form = d
            }
        },
        handleOk() {
            if (this.loading) {
                return;
            }
            this.loading = true;
            var fn = createDataset
            if (this.edit) fn = updateDataset

            var d = Object.assign({}, this.form)
            d.labels = (d.labels || "").split("\n")
            d.probability = parseFloat(d.probability)

            fn(d).then(res => {
                console.log(res)
                this.$emit("ok")
                this.closeForm()
            }).catch(err => {
                this.loading = false
                this.$message.error(err.response.data.error)
            })
        },
        handleSuccess(response, file, fileList) {
            if (response.files.length > 0) {
                this.form.model_path = response.files[0]
                return
            }
            this.$message.warning(`上传失败，请确认文件类型是否正确`);
        },
        closeForm() {
            this.loading = false;
            this.dialog = false;
        }
    },
    data() {
        return {
            loading: false,
            dialog: false,
            edit: false,
            form: {
                id: '',
                name: '',
                type: [],
            },
            formLabelWidth: '80px',
        }
    }
}
</script>