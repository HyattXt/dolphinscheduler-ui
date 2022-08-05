<template>
  <n-space vertical>
    <n-card size="small">
      <n-space justify="space-between"	style="height: 40px">
        <n-button type='primary' @click="showModal = true"> 新建服务</n-button>
        <n-modal v-model:show="showModal">
          <n-card
              style="width: 700px"
              title="选择API类型"
              aria-modal="true"
              size="huge"
          >
            <n-space vertical >
                <n-space inline>
                  <router-link to='/service/api-dev-step'>
                <n-button strong type="info"> 自定义API </n-button>
                  </router-link>
                    <n-gradient-text :size="18" >
                           支持通过自定义SQL方式发布数据服务API
                    </n-gradient-text>
                </n-space>
                <n-space inline>
                  <router-link to='/service/api-register'>
                <n-button strong type="info"> 注册API </n-button>
                  </router-link>
                <n-gradient-text :size="18" >
                          支持将已有Web服务注册到平台进行统一管理
                </n-gradient-text>
                </n-space>
            </n-space>
          </n-card>
        </n-modal>
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
  <n-drawer v-model:show="active" :width="502">
    <n-drawer-content closable>
      <template #header>
        API调试: {{drawTitle}}
      </template>
      <n-card title="请求参数" size="small">
        <n-table :single-line="false" size="small">
          <thead>
          <tr>
            <th>参数名称</th>
            <th>参数值</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="item in paramList">
            <td>{{ item.key }}</td>
            <n-input size="large" v-model:value="item.value"></n-input>
          </tr>
          </tbody>
        </n-table>
        <template #footer>
          <n-button type="primary" @click="debugApi">开始调试</n-button>
        </template>
      </n-card>
      <n-card title="调试结果" style="margin-top: 10px">
        <div>
          <n-scrollbar style="max-height: 300px">
          <n-config-provider :hljs="hljs">
            <n-code :code="code" language="javascript" />
          </n-config-provider>
          </n-scrollbar>
        </div>
      </n-card>
    </n-drawer-content>
  </n-drawer>
</template>

<script>
import {defineComponent, ref, reactive, onMounted, h} from 'vue';
import { useRouter } from "vue-router"
import axios from "axios";
import { DeleteOutlined, EditOutlined, SearchOutlined, CodeOutlined } from "@vicons/antd";
import { NButton, NSpace, useMessage, NPopconfirm, NTooltip, NIcon } from "naive-ui";
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import moment from 'moment'

hljs.registerLanguage('javascript', javascript)


const columns = ({play},{del},{editApi}) => {
  return [  {
    title: 'ID',
    key: 'apiId'
  },
    {
      title: '名称',
      key: 'apiName'
    },
    {
      title: '方式',
      key: 'apiMethod',
      width: 61
    },
    {
      title: '路径',
      key: 'apiPath'
    },
    {
      title: '状态',
      key: 'apiStatus',
      width: 66
    },
    {
      title: 'API类型',
      key: 'apiFlag',
      width: 80
    },
    {
      title: '创建时间',
      key: 'apiCreateTime',
    },
    {
      title: '操作',
      key: 'actions',
      width: 132,
      render(row) {
        return h(NSpace, null, {
          default: () =>
            [ h(
              NTooltip,
              {},
              {
                trigger: () =>
                  h(
                    NButton,
                    {
                      circle: true,
                      type: 'info',
                      size: 'small',
                      class: 'edit',
                      onClick: () => {
                        play(row)
                      }
                    },
                    {
                      icon: () =>
                        h(NIcon, null, { default: () => h(CodeOutlined) })
                    }
                  ),
                default: () => "调试"
              }
            ),
              h(
                NTooltip,
                {},
                {
                  trigger: () =>
                    h(
                      NButton,
                      {
                        disabled:(row.apiStatus === '发布'),
                        circle: true,
                        type: 'info',
                        size: 'small',
                        class: 'edit',
                        onClick: () => {
                          editApi(row)
                        }
                      },
                      {
                        icon: () =>
                          h(NIcon, null, { default: () => h(EditOutlined) })
                      }
                    ),
                  default: () => "编辑"
                }
              ),
              h(
                NPopconfirm,
                {
                  onPositiveClick: () => {
                    del(row);
                  }
                },
                {
                  trigger: () =>
                    h(
                      NTooltip,
                      {},
                      {
                        trigger: () =>
                          h(
                            NButton,
                            {
                              disabled:(row.apiStatus === '发布'),
                              circle: true,
                              type: 'error',
                              size: 'small',
                              class: 'delete'
                            },
                            {
                              icon: () =>
                                h(NIcon, null, {
                                  default: () => h(DeleteOutlined)
                                })
                            }
                          ),
                        default: () => "删除"
                      }
                    ),
                  default: () => "确定删除吗？"
                }
              )
            ]
        })
      }
    }];
};

const TableData=reactive({
  apiList: [],
  totalNum: 0
})


function query (page, pageSize = 10 ,apiName ="",apiFlag ="",apiStatus="",apiPath="") {
  return new Promise((resolve) => {
    const url ='/interface/getList'
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
              300
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
    const active = ref(false);
    const drawTitle = ref("");
    const drawPath = ref("");
    const drawParam = ref({});
    const drawId = ref("");
    const drawScript = ref("");
    const drawMethod = ref("");
    const paramList = ref([]);
    const code = ref("");
    const router = useRouter();
    const activate = (row) => {
      code.value = '';
      active.value = true;
      drawTitle.value = row.apiName;
      drawPath.value = row.apiPath;
      drawId.value = row.apiId;
      drawScript.value = row.apiScript;
      drawMethod.value = row.apiMethod;
      drawParam.value=JSON.parse(row.apiSample);
      drawParam.value=JSON.parse(drawParam.value.requestBody);
      paramList.value = Object.entries(drawParam.value).map(([key, value]) => ({
        key, value
      }))
      console.log(paramList.value);
      console.log(drawTitle);
      console.log(drawParam.value);
    };
    const message = useMessage();

    function refresh(currentPage) {
      query(
        currentPage,
        paginationReactive.pageSize,
        paginationReactive.apiName,
        paginationReactive.apiFlag,
        paginationReactive.apiStatus,
        paginationReactive.apiPath
      ).then((data) => {
        dataRef.value = data.data
        dataRef.value.apiCreateTime=dataRef.value.forEach(item => {
          let date = new Date(parseInt(item.apiCreateTime));
          item.apiCreateTime = moment(date).format("YYYY-MM-DD HH:mm:ss")
        })
        dataRef.value.apiStatus=dataRef.value.forEach(item => {
          if (item.apiStatus === "-1") {item.apiStatus = "删除";}
          if (item.apiStatus === "0") {item.apiStatus = "待发布";}
          if (item.apiStatus === "1") {item.apiStatus = "发布";}
          if (item.apiStatus === "2") {item.apiStatus = "有变更";}
          if (item.apiStatus === "3") {item.apiStatus = "禁用";}
        })
        dataRef.value.apiFlag=dataRef.value.forEach(item => {
          if (item.apiFlag === 1) {item.apiFlag = "接口开发";}
          if (item.apiFlag === 2) {item.apiFlag = "接口注册";}
        })
        paginationReactive.page = currentPage
        paginationReactive.pageCount = data.pageCount
        paginationReactive.itemCount = data.total
      })
    }
    const columnsRef = ref(columns({
      play(row) {
        activate(row);
      }
    },
      {
        del(row) {
          let urlDel='/interface/deleteByApiId';
          let delPar = {
            apiId:""
          };
          delPar.apiId=row.apiId
          axios.post(urlDel, delPar)
            .then(function(response) {
                console.log(response);
                message.info(`成功删除 ${row.apiName}`);
                refresh(paginationReactive.page);
              }
            )
        }
      },
      {
        editApi(row) {
          if(row.apiFlag==='接口开发'){
            router.push({
              path:'/service/api-dev-step-edit',
              query: { apiId: row.apiId }
            })
          }else{
            router.push({
              path:'/service/api-register-edit',
              query: { apiId: row.apiId }
            })
          }
          message.info(`编辑 ${row.apiName}`);
        }
      }
    ),)
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
        dataRef.value.apiCreateTime=dataRef.value.forEach(item => {
          let date = new Date(parseInt(item.apiCreateTime));
          item.apiCreateTime = moment(date).format("YYYY-MM-DD HH:mm:ss")
        })
        dataRef.value.apiStatus=dataRef.value.forEach(item => {
          if (item.apiStatus === "-1") {item.apiStatus = "删除";}
          if (item.apiStatus === "0") {item.apiStatus = "待发布";}
          if (item.apiStatus === "1") {item.apiStatus = "发布";}
          if (item.apiStatus === "2") {item.apiStatus = "有变更";}
          if (item.apiStatus === "3") {item.apiStatus = "禁用";}
        })
        dataRef.value.apiFlag=dataRef.value.forEach(item => {
          if (item.apiFlag === 1) {item.apiFlag = "接口开发";}
          if (item.apiFlag === 2) {item.apiFlag = "接口注册";}
        })
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
      showModal: ref(false),
      active,
      activate,
      drawParam,
      drawId,
      paramList,
      drawPath,
      drawTitle,
      drawScript,
      drawMethod,
      rowKey (rowData) {
        return rowData.apiId
      },
      code,
      hljs,
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
          label: '待发布',
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
            dataRef.value.apiCreateTime=dataRef.value.forEach(item => {
              let date = new Date(parseInt(item.apiCreateTime));
              item.apiCreateTime = moment(date).format("YYYY-MM-DD HH:mm:ss")
            })
            dataRef.value.apiStatus=dataRef.value.forEach(item => {
              if (item.apiStatus === "-1") {item.apiStatus = "删除";}
              if (item.apiStatus === "0") {item.apiStatus = "待发布";}
              if (item.apiStatus === "1") {item.apiStatus = "发布";}
              if (item.apiStatus === "2") {item.apiStatus = "有变更";}
              if (item.apiStatus === "3") {item.apiStatus = "禁用";}
            })
            dataRef.value.apiFlag=dataRef.value.forEach(item => {
              if (item.apiFlag === 1) {item.apiFlag = "接口开发";}
              if (item.apiFlag === 2) {item.apiFlag = "接口注册";}
            })
            paginationReactive.page = currentPage
            paginationReactive.pageCount = data.pageCount
            paginationReactive.itemCount = data.total
            loadingRef.value = false
          })
        }
      },
      debugApi (){
          let url = drawPath.value;
          let list = paramList.value;
          let requestBody = {};
          for(let i=0;i<list.length;i++){
          requestBody[list[i].key]=list[i].value
          };
          if(url.indexOf('proxy')>0){
            if(drawMethod.value==='GET'){
            let regUrl = url.replace('/proxy','/hddebug/proxy');
            console.log(requestBody);
            console.log(url);
          axios.get(regUrl)
            .then(function(response) {
                console.log(response);
              code.value = JSON.stringify(response.data, null, 2);
              }
            ).catch(function(error) {
            code.value = JSON.stringify(error, null, 2);
            console.log(error);
          })}
            else{
              let regUrl = url.replace('/proxy','/hddebug/proxy');
              console.log(requestBody);
              console.log(url);
              axios.post(regUrl,requestBody)
                .then(function(response) {
                    console.log(response);
                    code.value = JSON.stringify(response.data, null, 2);
                  }
                ).catch(function(error) {
                code.value = JSON.stringify(error, null, 2);
                console.log(error);
              })
            }
          }
          else{
            let sqlUrl = '/interface-ui/api/perform?id='+drawId.value;
            let sqlBody = {
              "id": drawId.value,
              "select": "POST",
              "apiPath": drawPath.value,
              "codeType": "SQL",
              "codeValue": drawScript.value,
              "requestBody": requestBody,
              "optionInfo": {
                "resultStructure": true,
                "responseFormat": "{\n \"success\" : \"@resultStatus\",\n \"message\" : \"@resultMessage\",\n \"code\" : \"@resultCode\",\n \"lifeCycleTime\": \"@timeLifeCycle\",\n \"executionTime\": \"@timeExecution\",\n \"value\" : \"@resultData\"\n}"
              }
            }
            axios.post(sqlUrl, sqlBody)
              .then(function(response) {
                  console.log(response);
                  code.value = JSON.stringify(response.data, null, 2);
                }
              ).catch(function(error) {
              code.value = JSON.stringify(error, null, 2);
              console.log(error);
            })
          }
      }
    }
  }
})
</script>

<style scoped>
a {
  text-decoration: none;
}
.n-gradient-text{
  color: #555555;
}

</style>
