<script setup lang="ts">
import { onMounted } from 'vue'
import { add } from '@hfdraw/utils'
import { GraphView } from '@hfdraw/graph'
// @ts-ignore
import { modelService } from '@/util/ModelService'
// @ts-ignore
import { generateRandomNumber } from '@/util/common'

const res = add(1, 2)
console.log('res:', res)
async function getApplication() {
  const data = await modelService.getApplicationProject()
  console.log('data:', data)
}
async function createApplication() {
  const projectId = generateRandomNumber();
  const params = {
    projectId,
    "name": "文件" + projectId,
    "createdAt": "2024-10-1",
    "updatedAt": "2024-11-4"
  }
  const data = await modelService.createApplicationProject(params)
  console.log('data:', data)
}
</script>

<template>
  <!-- <GraphView/>
  <button @click="createApplication">创建应用项目</button>
  <button  >创建项目</button>
  <button @click="getApplication">获取项目</button> -->

  <div class="v-app-container">
    <router-view />
  </div>
</template>

<style>
.v-app-container {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}
body {
  margin:0;
  padding: 0;
}
</style>
