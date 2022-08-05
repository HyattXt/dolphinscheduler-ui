<template>
  <n-space vertical>
    <n-card size="small">
      <n-space justify="end"	style="height: 40px">
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
  <n-drawer v-model:show="active" :width="700">
    <n-drawer-content closable>
      <template #header>
        查看API详情: {{drawTitle}}
      </template>
      <n-card  size="small">
        <n-descriptions label-placement="left" title="基本信息">
          <n-descriptions-item label="API名称">
            {{basicInfo.apiName}}
          </n-descriptions-item>
          <n-descriptions-item label="API类型">
            {{basicInfo.apiFlag}}
          </n-descriptions-item>
          <n-descriptions-item label="更新时间">
            {{basicInfo.apiGmtTime}}
          </n-descriptions-item>
          <n-descriptions-item label="描述">
            {{basicInfo.apiComment}}
          </n-descriptions-item>
          <n-descriptions-item label="创建人">
            {{basicInfo.apiCreator}}
          </n-descriptions-item>
          <n-descriptions-item label="频次限制">
            {{basicInfo.apiFrequency}}次/秒
          </n-descriptions-item>
          <n-descriptions-item label="后端超时">
            {{basicInfo.apiTimeout}}ms
          </n-descriptions-item>
        </n-descriptions>
      </n-card>
      <n-card  size="small" style="margin-top: 10px">
        <n-descriptions label-placement="left" title="自定义SQL" column="1">
          <n-descriptions-item label="数据源">
            API服务
          </n-descriptions-item>
          <n-descriptions-item label="自定义SQL">
            {{basicInfo.apiScript}}
          </n-descriptions-item>
        </n-descriptions>
      </n-card>
    </n-drawer-content>
  </n-drawer>
  <n-modal
    v-model:show="showModal"
    class="custom-card"
    :style="{ height: '450px',width:'600px' }"
    preset="card"
    title="授权API给用户"
    size="huge"
    :bordered="false"
  >
    <n-form-item label="API名称 : " label-placement="left">
      {{drawTitle}}
    </n-form-item>
    <n-form-item label="授权用户" label-placement="left" path="user.name">
      <n-transfer
        ref="transfer"
        v-model:value="apiAuthorizer"
        virtual-scroll
        :options="userList"
        filterable
      />
    </n-form-item>
    <n-space justify="end">
      <n-button type="info" @click="subAuth">确定</n-button>
    </n-space>
  </n-modal>
</template>

<script>
import {defineComponent, ref, reactive, onMounted, h} from 'vue';
import axios from "axios";
import { UserOutlined, SearchOutlined, ToTopOutlined, ProfileOutlined, VerticalAlignBottomOutlined } from "@vicons/antd";
import { NButton, NSpace, useMessage, NTooltip, NIcon, NPopconfirm } from "naive-ui";
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import moment from 'moment'

hljs.registerLanguage('javascript', javascript)

const columns = ({play},{pub},{auth}) => {
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
                      type: (row.apiAuthorizer === null)?'warning':'info',
                      size: 'small',
                      class: 'edit',
                      onClick: () => {
                        auth(row)
                      }
                    },
                    {
                      icon: () =>
                        h(NIcon, null, { default: () => h(UserOutlined) })
                    }
                  ),
                default: () => "授权"
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
                          h(NIcon, null, { default: () => h(ProfileOutlined) })
                      }
                    ),
                  default: () => "查看"
                }
              ),
              h(
                NPopconfirm,
                {
                  onPositiveClick: () => {
                    pub(row);
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
                              disabled:(row.apiAuthorizer === null),
                              circle: true,
                              type: (row.apiStatus === '待发布')?'info':'warning',
                              size: 'small',
                              class: 'edit'
                            },
                            {
                              icon: () =>
                                h(NIcon, null, {
                                  default: () => (row.apiStatus === '待发布')?h(ToTopOutlined):h(VerticalAlignBottomOutlined)
                                })
                            }
                          ),
                        default: () => (row.apiStatus === '待发布')?"发布":"下线"
                      }
                    ),
                  default: () => (row.apiStatus === '待发布')?"确定发布吗？":"确定下线吗？"
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
    const showModal = ref(false);
    const drawTitle = ref("");
    const drawId = ref("");
    const userList = ref([]);
    const apiAuthorizer = ref([]);
    const basicInfo = ref({});
    const activate = (row) => {
      active.value = true;
      drawTitle.value = row.apiName;
      console.log(drawTitle);
      basicInfo.value={};
      queryBasic(row.apiId);
    };
    const actAuth =(row) => {
      showModal.value = true;
      drawTitle.value = row.apiName;
      drawId.value = row.apiId;
      console.log(drawTitle);
      queryUser();
    };
    const message = useMessage();

    function queryUser () {
      const listUrl ='/interface/getUser'
      const authListUrl ='/interface/getAuthorizeInfo'
      axios.get(listUrl)
        .then(function (response) {
            console.log(response);
            userList.value=response.data.data;
            userList.value = userList.value.map(item => {
              let tempList = {};
              tempList.value = item.id;
              tempList.label = item.userName;
              return tempList
            });
            console.log(userList.value)
          }
        )
      let authBody = {
        "apiId": ""
      }
      authBody.apiId = drawId.value;
      console.log(authBody);
      axios.post(authListUrl,authBody)
        .then(function (response) {
            console.log("response");
            console.log(response);
            apiAuthorizer.value=response.data.data;
            apiAuthorizer.value = apiAuthorizer.value.map(item => {
              let authList = '';
              authList = item.id;
              return authList
            });
          console.log("apiAuthorizer");
            console.log(apiAuthorizer.value)
          }
        )
    }

    function queryBasic (apiId) {
      const url ='/interface/getInterfaceInfoById'
      let basicPar = {
        apiId : drawId.value
      };
      basicPar.apiId=apiId;
      axios.post(url,basicPar)
        .then(function (response) {
          console.log(response);
          basicInfo.value=response.data.obj;
          if (basicInfo.value.apiFlag === 1) {basicInfo.value.apiFlag = "接口开发";}
          if (basicInfo.value.apiFlag === 2) {basicInfo.value.apiFlag = "接口注册";}
          let date = new Date(parseInt(basicInfo.value.apiGmtTime));
          basicInfo.value.apiGmtTime = moment(date).format("YYYY-MM-DD HH:mm:ss")
          }
        )
    }

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

    function subAuth() {
      let subUrl = '/interface/insertAuthorizeInfo';
      let requestBody ={
        "apiId": drawId.value,
        "authorizeId": apiAuthorizer.value
      }
      axios.post(subUrl,requestBody)
        .then(function(response) {
            message.info('授权成功');
            showModal.value = false;
            console.log(response);
            refresh(paginationReactive.page);
          }
        ).catch(function(error) {
        message.info('授权失败,请联系管理员');
        console.log(error);
      })
      console.log(apiAuthorizer)
    }

    const columnsRef = ref(columns({
        play(row) {
          activate(row);
        }
      },
      {
        pub(row) {
          if(row.apiStatus === '待发布'){
            if(row.apiFlag==='接口开发'){
              let urlPub=`/interface-ui/api/publish?id=${row.apiId}`;
              let pubPar = {
                id:""
              };
              pubPar.id=row.apiId
              axios.post(urlPub, pubPar)
                .then(function(response) {
                    console.log(response);
                    message.info(`成功发布 ${row.apiName}`);
                    refresh(paginationReactive.page)
                  }
                ).catch(function(error) {
                message.info('发布失败,请联系管理员');
                console.log(error);
              })
            }else{
              let urlPub=`/interface/update`;
              let pubPar = {
                apiId: "",
                apiStatus: 1
              };
              pubPar.apiId=row.apiId
              axios.post(urlPub, pubPar)
                .then(function(response) {
                    console.log(response);
                    message.info(`成功发布 ${row.apiName}`);
                    refresh(paginationReactive.page)
                  }
                ).catch(function(error) {
                message.info('发布失败,请联系管理员');
                console.log(error);
              })
            }
          }else{
            let urlPub=`/interface/update`;
            let pubPar = {
              apiId: "",
              apiStatus: 0
            };
            pubPar.apiId=row.apiId
            axios.post(urlPub, pubPar)
              .then(function(response) {
                  console.log(response);
                  message.info(`成功下线 ${row.apiName}`);
                  refresh(paginationReactive.page)
                }
              ).catch(function(error) {
              message.info('下线失败,请联系管理员');
              console.log(error);
            })
          }
        }
      },
      {
        auth(row) {
          actAuth(row);
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
      showModal,
      active,
      activate,
      drawTitle,
      drawId,
      userList,
      basicInfo,
      apiAuthorizer,
      subAuth,
      rowKey (rowData) {
        return rowData.apiId
      },
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
          label: '待发布',
          value: '0'
        },
        {
          label: '发布',
          value: '1'
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
