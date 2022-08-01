<template>
  <n-scrollbar style="max-height: 300px">
    <n-form
        :model="formValue"
        label-placement="top"
    >
      <n-form-item label="数据源类型" path="sourceType">
        <n-select size="small" v-model:value="formValue.sourceType" :options='[{"label":"MYSQL","value":"MYSQL"}]' />
      </n-form-item>
      <n-form-item label="数据源" path="source">
        <n-select size="small" v-model:value="formValue.source" :options='[{"label":"API服务","value":"API服务"}]' />
      </n-form-item>
      <n-form-item label="数据表" path="table">
        <n-select
          label-field="TABLE_NAME"
          value-field="TABLE_NAME"
          size="small"
          filterable
          :options="tList"
          @click="queryTab"
          v-model:value="formValue.table"
          @update:value="queryCol(formValue.table)"
        />
      </n-form-item>
      <n-form-item label="字段预览">
        <n-data-table
          size="small"
          :single-line="false"
          :columns='[{"title":"字段名称","key":"COLUMN_NAME"},{"title":"字段类型","key":"COLUMN_TYPE"}]'
          :data="colList"
        >
        </n-data-table>
      </n-form-item>
    </n-form>
  </n-scrollbar>
</template>

<script lang="ts" setup>
import { Ref, ref } from 'vue';
import { useMessage } from 'naive-ui';
import axios from "axios";


const emit = defineEmits(['nextStep']);

const form1Ref = ref(null);
const message = useMessage();
const tList = ref([]);
const colList = ref([]);

const formValue = ref({
  sourceType: '',
  source: '',
  table: ''
});


function queryTab () {
    const url ='/interface/getTables'

    axios.get(url)
      .then(function (response) {
        console.log(response);
        tList.value=response.data.data;
        }
      )
      }

function queryCol (table:string) {
  const url ='/interface/getColumnsByTable'
  const params = {
    tableName : table
  }
  axios.post(url,params)
    .then(function (response) {
        console.log(response);
        colList.value=response.data.data;
      }
    )
}

</script>

<style scoped>

.n-data-table{
  font-size: 5px;
}

</style>
