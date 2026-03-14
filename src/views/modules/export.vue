<template>
  <el-dialog :visible.sync="dialog" width="600px" :before-close="handleClose" :show-header="false">
    <div class="dialog-content">
      <div class="dialog-title">导出数据集</div>
      <el-form :model="form" :rules="rules" ref="form" label-width="100px">
        <el-form-item label="导出路径" prop="path">
          <el-input v-model="form.path" placeholder="输入要保存 Yolo 数据集的路径"></el-input>
        </el-form-item>
        <el-form-item label="选择标签" required>
          <div class="label-select-header">
            <el-link type="primary" @click="selectAll">全选</el-link>
            <el-link type="danger" @click="unselectAll">全不选</el-link>
          </div>
          <el-checkbox-group v-model="form.labels">
            <div class="label-checkbox-grid">
              <el-checkbox v-for="label in datasetLabels" :key="label" :label="label">
                {{ label }}
              </el-checkbox>
            </div>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleOk" :loading="loading">{{ loading ? '导出中...' : '确定' }}</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { exportDataset } from '@/api/api'

export default {
  name: "ExportDialog",
  methods: {
    show(dataset) {
      this.currentDataset = dataset
      this.form.path = this.getStoredPath() || ''
      const storedLabels = this.getStoredLabels()
      if (storedLabels && storedLabels.length > 0) {
        this.form.labels = storedLabels.filter(label => dataset.labels.includes(label))
      } else {
        this.form.labels = []
      }
      console.log(dataset)
      this.$nextTick(() => {
        this.dialog = true
        if (this.$refs.form) {
          this.$refs.form.clearValidate()
        }
      })
    },
    getStoredPath() {
      try {
        const stored = localStorage.getItem('export_path')
        return stored || ''
      } catch (e) {
        console.error('读取存储路径失败:', e)
        return ''
      }
    },
    getStoredLabels() {
      try {
        const stored = localStorage.getItem('export_labels')
        return stored ? JSON.parse(stored) : null
      } catch (e) {
        console.error('读取存储标签失败:', e)
        return null
      }
    },
    saveToStorage() {
      try {
        localStorage.setItem('export_path', this.form.path)
        localStorage.setItem('export_labels', JSON.stringify(this.form.labels))
      } catch (e) {
        console.error('保存存储失败:', e)
      }
    },
    selectAll() {
      this.form.labels = [...this.datasetLabels]
    },
    unselectAll() {
      this.form.labels = []
    },
    handleOk() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          if (this.form.labels.length === 0) {
            this.$message.warning('请至少选择一个标签')
            return
          }
          this.loading = true
          this.saveToStorage()
          const params = {
            path: this.form.path,
            ds: this.currentDataset.id
          }
          if (this.form.labels.length === this.datasetLabels.length) {
            params.labels = []
          } else {
            params.labels = this.form.labels
          }
          exportDataset(params).then((res) => {
            this.$message.success("成功导出" + res.data.count + "个图片")
            this.handleClose()
            this.$emit("ok")
          }).catch(err => {
            this.$message.error(err.response.data.error)
          }).finally(() => {
            this.loading = false
          })
        }
      })
    },
    handleClose() {
      this.dialog = false
      this.loading = false
    }
  },
  data() {
    return {
      loading: false,
      dialog: false,
      currentDataset: null,
      form: {
        path: '',
        labels: []
      },
      rules: {
        path: [
          { required: true, message: '请输入导出路径', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    datasetLabels() {
      return this.currentDataset ? this.currentDataset.labels : []
    }
  }
}
</script>

<style scoped>
.dialog-content {
  padding: 20px;
}

.dialog-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 20px;
}

.label-select-header {
  margin-bottom: 10px;
  display: flex;
  gap: 15px;
}

.label-checkbox-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #dcdfe6;
  padding: 10px;
  border-radius: 4px;
}

.label-checkbox-grid .el-checkbox {
  margin-right: 0;
}
</style>
