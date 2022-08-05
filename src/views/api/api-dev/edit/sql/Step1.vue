<template>
  <n-form
    :label-width="90"
    :model="formValue"
    :rules="rules"
    label-placement="left"
    ref="form1Ref"
    style="max-width: 800px; margin: 40px auto 0 80px"
  >
    <n-form-item label="API名称" path="apiName">
      <n-input
        placeholder="请输入名称"
        v-model:value="formValue.apiName"
      />
    </n-form-item>
    <n-form-item label="API路径" path="apiPath">
        <n-input
          placeholder="请输入路径 /api/开头"
          v-model:value="formValue.apiPath"
        />
    </n-form-item>
    <n-form-item label="请求方式" path="select">
      <n-select
          placeholder="请选择"
          :options='[{"label":"POST","value":"POST"}]'
          v-model:value="formValue.select"
      />
    </n-form-item>
    <n-form-item label="创建人" path="apiCreator">
      <n-input
        placeholder="请输入"
        v-model:value="formValue.apiCreator"
      />
    </n-form-item>
    <n-space justify="space-between">
      <n-input-group>
    <n-form-item label="频次限制" path="apiFrequency">
      <n-input
        placeholder="请输入"
        v-model:value="formValue.apiFrequency"
      />
    </n-form-item>
      <n-input-group-label>次/秒</n-input-group-label>
      </n-input-group>
      <n-input-group>
    <n-form-item label="后端超时" path="apiTimeout">
      <n-input
        placeholder="请输入"
        v-model:value="formValue.apiTimeout"
      />
    </n-form-item>
      <n-input-group-label>ms</n-input-group-label>
      </n-input-group>
    </n-space>
    <n-form-item label="描述" path="comment">
      <n-input
          v-model:value="formValue.comment"
          type="textarea"
          :rows="2"
          placeholder="描述"
      />
    </n-form-item>
    <div style="margin-left: 300px">
      <n-space>
        <router-link to='/service/api-dev'>
          <n-button type="tertiary" >返回</n-button>
        </router-link>
        <n-button type="primary" @click="formSubmit">下一步</n-button>
      </n-space>
    </div>
  </n-form>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { useMessage } from 'naive-ui';

  const emit = defineEmits(['nextStep']);
  const form1Ref: any = ref(null);
  const message = useMessage();

  const formValue = ref({
    apiName: '',
    apiPath: '',
    apiCreator: '',
    apiFrequency: null,
    apiTimeout: null,
    select: null,
    comment: '',
    sourceType:null,
    source :null
  });

  const rules = {
    apiName: {
      required: true,
      message: '请输入名称',
      trigger: 'blur',
    },
    apiPath: {
      required: true,
      message: '请输入路径',
      trigger: 'blur',
    },
    select: {
      required: true,
      message: '请选择请求方式',
      trigger: 'blur',
    },
    sourceType: {
      required: true,
      message: '请选择数据源类型',
      trigger: 'blur',
    },
    source: {
      required: true,
      message: '请选择数据源',
      trigger: 'blur',
    },
    apiCreator: {
      required: true,
      message: '请输入创建人',
      trigger: 'blur',
    },
    apiFrequency: {
      required: true,
      message: '请输入调用频次',
      trigger: 'blur',
    },
    apiTimeout: {
      required: true,
      message: '请输入超时时间',
      trigger: 'blur',
    },
  };

  function formSubmit() {
    form1Ref.value.validate((errors: any) => {
      if (!errors) {
        emit('nextStep',formValue.value);
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
