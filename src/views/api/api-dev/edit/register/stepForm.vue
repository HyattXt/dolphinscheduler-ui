<template>
  <div>
    <div class="n-layout-page-header">
      <n-card :bordered="false" title="编辑API">
      </n-card>
    </div>
    <n-card :bordered="false" class="mt-4 proCard">
      <n-space vertical class="steps" justify="center">
        <n-steps :current="currentTab" :status="currentStatus">
          <n-step title="API信息修改" />
          <n-step title="完成修改"/>
        </n-steps>
        <step1 v-if="currentTab === 1" @nextStep="nextStep1" />
        <step2 v-if="currentTab === 2" @prevStep="prevStep" @finish="finish" />
      </n-space>
    </n-card>
  </div>
</template>

<script setup>
  import { defineComponent, ref } from 'vue';
  import step1 from './Step1.vue';
  import step2 from './Step2.vue';
  import axios from "axios";


  const currentTab = ref(1);
  const currentStatus = ref('process');



  function nextStep1() {
    if (currentTab.value < 2) {
      currentTab.value += 1;
    }
  }

    function prevStep() {
      if (currentTab.value > 1) {
        currentTab.value -= 1;
      }
    }

    function finish() {
      currentTab.value = 1;
    }
</script>

<style lang="less" scoped>
  .steps {
    max-width: 1200px;
    margin: 16px auto 16px 100px;
  }
</style>
