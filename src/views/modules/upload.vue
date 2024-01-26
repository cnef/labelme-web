<template>
    <el-drawer title="上传图片" :visible.sync="dialog" direction="rtl" custom-class="demo-drawer">
        <div class="demo-drawer__content">
            <el-upload class="upload-demo" action="/api/file/upload" multiple :limit="1000" :on-exceed="handleExceed"
                :file-list="fileList" :data="{ ds: ds }" :on-success="handleSuccess">
                <el-button size="small" type="primary">点击上传</el-button>
                <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
            </el-upload>
            <div class="demo-drawer__footer">
                <el-button @click="cancelForm">取消</el-button>
                <el-button type="primary" @click="cancelForm" :loading="loading">{{ loading ? '提交中 ...' :
                    '确定'
                }}</el-button>
            </div>
        </div>
    </el-drawer>
</template>
<script>
export default {
    name: "upload",
    methods: {
        show(ds) {
            this.dialog = true
            this.ds = ds
        },
        handleRemove(file, fileList) {
            console.log(file, fileList);
        },
        handleExceed(files, fileList) {
            this.$message.warning(`当前限制选择 1000 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`);
        },
        handleSuccess(response, file, fileList) {
            console.log(response)
        },
        cancelForm() {
            this.loading = false;
            this.dialog = false;
            this.$emit("ok")
        }
    },
    data() {
        return {
            fileList: [],
            ds: "",
            loading: false,
            dialog: false,
        }
    }
}
</script>