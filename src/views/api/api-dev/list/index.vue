
<template>
  <n-space vertical>
  <n-card size="small">
      <n-space justify="space-between"	>
        <n-button type='primary' > 新建服务</n-button>
          <n-form
              ref="formRef"
              :model="pagination"
          >
            <n-grid :cols="26" :x-gap="24">
            <n-form-item-gi :span="6" :show-label="false" path="pagination.apiName">
              <n-input size="small" v-model:value="pagination.apiName" placeholder="名称" />
            </n-form-item-gi>
            <n-form-item-gi :span="6" :show-label="false">
              <n-select size="small" v-model:value="pagination.apiFlag" :options="stateOptions" clearable placeholder="API类型" />
            </n-form-item-gi>
            <n-form-item-gi :span="6" :show-label="false">
              <n-select size="small" v-model:value="pagination.apiStatus" :options="statusOptions" clearable placeholder="API状态" />
            </n-form-item-gi>
            <n-form-item-gi :span="6" :show-label="false">
              <n-input size="small" v-model:value="pagination.apiPath" placeholder="路径" />
            </n-form-item-gi>
            <n-form-item-gi :span="2" :show-label="false">
              <n-button size="small" type='primary' @click="handlePageChange(1)" >
                <NIcon :component="SearchOutlined"></NIcon>
              </n-button>
            </n-form-item-gi>
            </n-grid>
          </n-form>
    </n-space>
  </n-card>
  <n-card>
    <n-data-table
        remote
        ref="table"
        :columns="columns"
        :data="data"
        :loading="loading"
        :pagination="pagination"
        :row-key="rowKey"
        @update:page="handlePageChange"
    />
  </n-card>
  </n-space>
</template>

<script>
import { defineComponent, ref, reactive, onMounted } from 'vue'
import axios from "axios";
import {SearchOutlined} from '@vicons/antd'

const columns = [
  {
    title: 'ID',
    key: 'apiId'
  },
  {
    title: '名称',
    key: 'apiName'
  },
  {
    title: '方式',
    key: 'apiMethod'
  },
  {
    title: '路径',
    key: 'apiPath'
  },
  {
    title: '状态',
    key: 'apiStatus',
  },
  {
    title: 'API类型',
    key: 'apiType',
  },
  {
    title: '创建时间',
    key: 'apiCreateTime',
  },
  {
    title: '操作',
    key: 'opera',
  },
]

const TableData=reactive({
  apiList: [],
  totalNum: 0
})

function query (page, pageSize = 10 ,apiName ="",apiFlag ="",apiStatus="",apiPath="") {
  return new Promise((resolve) => {
    const url ='http://127.0.0.1:4523/m1/1263204-0-default/listtest'
    const params = {
      "pageNum": page,
      "pageSize": pageSize,
      "apiName": apiName,
      "apiFlag": apiFlag,
      "apiStatus": apiStatus,
      "apiPath": apiPath,
      "order": "api_create_time",
      "sort": "desc"
    }

    axios.post(url,params)
        .then(function (response) {
          console.log(response);
          TableData.apiList=response.data.data;
          TableData.totalNum=response.data.totalNum;
          console.log(TableData.apiList);
          console.log(TableData.totalNum);
          const copiedData = TableData.apiList.map((v) => v)
          const total = TableData.totalNum
          const pageCount = Math.ceil(total / pageSize)

          setTimeout(
              () =>
                  resolve({
                    pageCount,
                    data: copiedData,
                    total
                  }),
              1500
          )
        })
        .catch(function (error) {
          console.log(error);
        });

  })
}

export default defineComponent({
  setup () {
    const dataRef = ref([])
    const loadingRef = ref(true)
    const columnsRef = ref(columns)
    const paginationReactive = reactive({
      page: 1,
      pageCount: 1,
      pageSize: 10,
      apiName: "",
      apiFlag: null,
      apiStatus: null,
      apiPath: "",
      prefix ({ itemCount }) {
        return `共${itemCount}条`
      }
    })

    onMounted(() => {
      query(
          paginationReactive.page,
          paginationReactive.pageSize,
          paginationReactive.apiName,
          paginationReactive.apiFlag,
          paginationReactive.apiStatus,
          paginationReactive.apiPath

      ).then((data) => {
        dataRef.value = data.data
        paginationReactive.pageCount = data.pageCount
        paginationReactive.itemCount = data.total
        loadingRef.value = false
      })
    })

    return {
      data: dataRef,
      columns: columnsRef,
      pagination: paginationReactive,
      loading: loadingRef,
      SearchOutlined,
      rowKey (rowData) {
        return rowData.apiId
      },
      stateOptions:[
        {
          label: '接口开发',
          value: '1'
        },
        {
          label: '接口注册',
          value: '2'
        }
      ],
      statusOptions:[
        {
          label: '删除',
          value: '-1'
        },
        {
          label: '草稿',
          value: '0'
        },
        {
          label: '发布',
          value: '1'
        },
        {
          label: '有变更',
          value: '2'
        },
        {
          label: '禁用',
          value: '3'
        }
      ],
      handlePageChange (currentPage) {
        if (!loadingRef.value) {
          loadingRef.value = true
          query(
              currentPage,
              paginationReactive.pageSize,
              paginationReactive.apiName,
              paginationReactive.apiFlag,
              paginationReactive.apiStatus,
              paginationReactive.apiPath
          ).then((data) => {
            dataRef.value = data.data
            paginationReactive.page = currentPage
            paginationReactive.pageCount = data.pageCount
            paginationReactive.itemCount = data.total
            loadingRef.value = false
          })
        }
      }
    }
  }
})
</script>

<style scoped>
</style>
