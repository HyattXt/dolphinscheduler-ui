<template>
  <n-form
    :model="formValue"
    label-placement="top"
    ref="form2Ref"
    style="max-width: 900px; margin: 40px auto 0 80px"
  >
    <n-grid x-gap="12" :cols="2">
      <n-gi span="1">
        <n-card>
    <n-form-item label="成功返回结果示例" path="comment">
      <n-scrollbar style="max-height: 250px">
        <n-config-provider :hljs="hljs">
          <n-code :code="success" language="javascript" />
        </n-config-provider>
      </n-scrollbar>
    </n-form-item>
        </n-card>
      </n-gi>
      <n-gi span="1">
        <n-card>
      <n-form-item label="失败返回结果示例" path="comment">
        <n-scrollbar style="max-height: 250px">
          <n-config-provider :hljs="hljs">
            <n-code :code="failure" language="javascript" />
          </n-config-provider>
        </n-scrollbar>
      </n-form-item>
        </n-card>
       </n-gi>
      </n-grid>
    <div style="margin-left: 250px;margin-top: 30px">
      <n-space>
        <n-button @click="prevStep">上一步</n-button>
        <n-button type="primary" :loading="loading" @click="formSubmit">提交</n-button>
      </n-space>
    </div>
  </n-form>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { useMessage } from 'naive-ui';
  import hljs from 'highlight.js/lib/core'
  import javascript from 'highlight.js/lib/languages/javascript'

  hljs.registerLanguage('javascript', javascript)

  const form2Ref: any = ref(null);
  const message = useMessage();
  const loading = ref(false);

  const formValue = ref({
    password: '086611',
  });


  const success =
    '     {\n' +
    '    "success": true,\n' +
    '    "message": "OK",\n' +
    '    "code": 200,\n' +
    '    "lifeCycleTime": "@timeLifeCycle",\n' +
    '    "executionTime": "@timeExecution",\n' +
    '    "value": "@resultData"\n' +
    '    }';

  const failure =
   '     {\n' +
   '       "success": false,\n' +
   '       "code": 500,\n' +
   '       "lifeCycleTime": "@timeLifeCycle",\n' +
   '       "executionTime": "@timeExecution",\n' +
   '     }';

  const emit = defineEmits(['prevStep', 'nextStep']);

  function prevStep() {
    emit('prevStep');
  }

  function formSubmit() {
    loading.value = true;
    form2Ref.value.validate((errors:any) => {
      if (!errors) {
        setTimeout(() => {
          emit('nextStep');
        }, 1500);
      } else {
        message.error('验证失败，请填写完整信息');
      }
    });
  }
</script>
