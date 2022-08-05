<template>
  <n-form
    :label-width="90"
    :model="formValue"
    :rules="rules"
    label-placement="left"
    ref="form1Ref"
    style="max-width: 800px; margin: 40px auto 0 80px"
  >
    <n-form-item label=服务名称 path="apiName" >
      <n-input
        :disabled="isDisable"
        placeholder="请输入"
        v-model:value="formValue.apiName"
      />
    </n-form-item>
      <n-form-item label="服务Host" path="apiIpaddr">
        <n-input
          :disabled="isDisable"
          placeholder="以http://开头，且不包含path"
          v-model:value="formValue.apiIpaddr"
        />
    </n-form-item>
    <n-form-item label="服务Path" path="apiPath">
      <n-input
        :disabled="isDisable"
        placeholder="以/开头"
        v-model:value="formValue.apiPath"
      />
    </n-form-item>
    <n-form-item label="请求方式" path="apiMethod">
      <n-select
        :disabled="isDisable"
        placeholder="请选择"
        :options='[{"label":"POST","value":"POST"},{"label":"GET","value":"GET"}]'
        v-model:value="formValue.apiMethod"
      />
    </n-form-item>
    <n-form-item label=创建人 path="apiCreator">
      <n-input
        :disabled="isDisable"
        placeholder="请输入"
        v-model:value="formValue.apiCreator"
      />
    </n-form-item>
    <n-form-item label="描述" path="comment">
      <n-input
        :disabled="isDisable"
        v-model:value="formValue.comment"
        type="textarea"
        :rows="2"
        placeholder="描述"
      />
    </n-form-item>
    <n-form-item label="请求header参数" path="comment" label-placement="top">
      <n-dynamic-input
        :disabled="isDisable"
        v-model:value="kvValue"
        preset="pair"
        key-placeholder="参数名"
        value-placeholder="参数值"
      />
    </n-form-item>
    <n-form-item label="请求body参数" path="comment" label-placement="top">
      <n-dynamic-input
        :disabled="isDisable"
        v-model:value="bodyValue"
        preset="pair"
        key-placeholder="参数名"
        value-placeholder="参数值"
      />
    </n-form-item>
    <div style="margin-left: 300px">
      <n-space>
        <router-link to='/service/api-dev'>
        <n-button type="tertiary" >返回</n-button>
        </router-link>
        <n-button type="primary" :disabled="isDisable" @click="formSubmit">确定</n-button>
      </n-space>
    </div>
  </n-form>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useMessage } from 'naive-ui';
import axios from "axios";
import { replace } from "lodash";

const form1Ref: any = ref(null);
const message = useMessage();
const isDisable= ref(false);
const kvValue = ref([]);
const bodyValue = ref([]);
const emit = defineEmits(['nextStep']);
const formValue = ref({
  apiName: '',
  apiPath: '',
  apiCreator: '',
  apiMethod: null,
  comment: '',
  apiIpaddr: '',
  apiFlag: 2,
  apiSample: ''
});

const rules = {
  apiName: {
    required: true,
    message: '请输入名称',
    trigger: 'blur',
  },
  apiIpaddr: {
    required: true,
    message: '请输入Host',
    trigger: 'blur',
  },
  apiPath: {
    required: true,
    message: '请输入路径',
    trigger: 'blur',
  },
  apiMethod: {
    required: true,
    message: '请选择请求方式',
    trigger: 'blur',
  },
  apiCreator: {
    required: true,
    message: '请输入创建人',
    trigger: 'blur',
  },
};

function formSubmit() {
  form1Ref.value.validate((errors: any) => {
    if (!errors) {
      let insUrl = '/interface/insert';
      let sample ={
        requestHeader: [],
        requestBody: {},
        responseHeader: [],
        responseBody: {}
      }
      let list = kvValue.value;
      let requestHeader = list.map(item=>{
        let tempHeader = {};
        tempHeader.checked='true';
        tempHeader.name=item.key;
        tempHeader.value=item.value;
        return tempHeader;
      })
      let bodyList = bodyValue.value;
      let requestBody:any = {};
      for(let i=0;i<bodyList.length;i++){
        requestBody[bodyList[i].key]=bodyList[i].value
      }
      console.log(requestHeader);
      formValue.value.apiPath='/proxy'+formValue.value.apiPath;
      sample.requestHeader=requestHeader;
      sample.requestBody=requestBody;
      formValue.value.apiSample = JSON.stringify(sample, null, 2)
      console.log(formValue.value)
      axios.post(insUrl, formValue.value)
        .then(function(response) {
            console.log(response);
            message.info("注册成功！")
            isDisable.value=true
            formValue.value.apiPath=formValue.value.apiPath.replace('/proxy','')
            emit('nextStep')
          }
        ).catch(function (error) {
        message.error('注册失败，请咨询管理员');
      })
    } else {
      message.error('验证失败，请填写完整信息');
    }
  });
}
</script>

<style scoped>
a {
  text-decoration: none;
}

</style>
