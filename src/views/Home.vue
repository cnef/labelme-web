<template>
  <div class="home">
    <el-button type="primary" @click="$refs.datasetEditor.show()">添加</el-button>

    <el-table :data="tableData" style="width: 100%" :row-class-name="tableRowClassName">
      <el-table-column prop="id" label="编号" width="180">
      </el-table-column>
      <el-table-column prop="name" label="说明" width="180">
      </el-table-column>
      <el-table-column prop="model_path" label="模型文件">
      </el-table-column>
      <el-table-column prop="model_args" label="模型参数">
      </el-table-column>
      <el-table-column prop="labels" label="标签">
        <template slot-scope="scope">
          <el-tag size="medium">{{ scope.row.labels.length }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="count" label="图片数">
      </el-table-column>
      <el-table-column fixed="right" label="操作" width="200">
        <template slot-scope="scope">
          <el-button @click="$refs.datasetEditor.show(scope.row)" type="text" size="small">编辑</el-button>
          <el-button type="text" size="small" @click="$refs.uploader.show(scope.row.id)">上传</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div style="padding: 10px;">
      <el-pagination background layout="prev, pager, next" :total="1000">
      </el-pagination>
    </div>

    <Upload ref="uploader" @ok="handleOk"></Upload>
    <Dataset ref="datasetEditor" @ok="handleOk"></Dataset>

  </div>
</template>

<style>
.el-table .warning-row {
  background: oldlace;
}

.el-table .success-row {
  background: #f0f9eb;
}
</style>

<script>
import Upload from './modules/upload.vue'
import Dataset from './modules/dataset.vue'
import { getDatasets } from '@/api/api'

export default {
  components: {
    Upload,
    Dataset
  },
  methods: {
    tableRowClassName({ row, rowIndex }) {
      if (rowIndex === 1) {
        return 'warning-row';
      } else if (rowIndex === 3) {
        return 'success-row';
      }
      return '';
    },
    handleOk() {
      this.loadData()
    },
    loadData() {
      getDatasets({
        offset: 0,
        pageSize: 10,
      }).then((res) => {
        console.log(res)
        this.tableData = res.data.rows
      }).catch(err => {
        this.$message.error(err.response.data.error)
      })
    }
  },
  mounted() {
    this.loadData()
  },
  data() {
    return {
      loading: false,
      tableData: []
    }
  }
}
</script>