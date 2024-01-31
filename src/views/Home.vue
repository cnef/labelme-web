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
      <el-table-column prop="input_shape" label="input_shape">
      </el-table-column>
      <el-table-column prop="output_shape" label="output_shape">
      </el-table-column>
      <el-table-column prop="probability" label="置信度阈值">
      </el-table-column>
      <el-table-column prop="labels" label="标签">
        <template slot-scope="scope">
          <el-tag size="medium">{{ scope.row.labels.length }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="count" label="图片数">
      </el-table-column>
      <el-table-column fixed="right" label="操作" width="360">
        <template slot-scope="scope">
          <el-button @click="$refs.datasetEditor.show(scope.row)" type="text" size="small">编辑</el-button>
          <el-button type="text" size="small" @click="importCoco(scope.row.id)">导入</el-button>
          <el-button type="text" size="small" @click="$refs.uploader.show(scope.row.id)">上传</el-button>
          <el-button type="text" size="small"
            @click="$router.push({ name: 'labelMain', params: { dataset: scope.row.id, offset: 0, id: 0 } })">标注</el-button>
          <el-button type="text" size="small"
            @click="$router.push({ name: 'labelVerify', params: { dataset: scope.row.id, label: '', offset: 0 } })">巡检</el-button>
          <el-button type="text" size="small" @click="exportYolo(scope.row.id)">导出</el-button>
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
import Upload from '@/views/modules/upload.vue'
import Dataset from '@/views/modules/dataset.vue'
import { getDatasets, importDataset, exportDataset } from '@/api/api'

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
    },
    importCoco(ds) {
      var path = prompt("输入要导入 Coco 数据集的路径")
      if (path != "") {
        importDataset({ path: path, ds: ds }).then((res) => {
          this.$message.success("成功导入" + res.data.count + "个图片")
          this.handleOk()
        }).catch(err => {
          this.$message.error(err.response.data.error)
        })
      }
    },
    exportYolo(ds) {
      var path = prompt("输入要保存 Yolo 数据集的路径")
      if (path != "") {
        exportDataset({ path: path, ds: ds }).then((res) => {
          this.$message.success("成功导出" + res.data.count + "个图片")
          this.handleOk()
        }).catch(err => {
          this.$message.error(err.response.data.error)
        })
      }
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