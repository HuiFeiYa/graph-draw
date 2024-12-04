<script setup>
import { onMounted } from 'vue'
import { add } from '@hfdraw/utils'
import {GraphView} from '@hfdraw/graph'
import { modelService } from '@/util/ModelService'
import { generateRandomNumber } from '@/util/common.js'
import HelloWorld from './components/HelloWorld.vue'
const res = add(1,2)
console.log('res:', res)
async function getApplication() {
  const data = await modelService.getApplicationProject()
  console.log('data:',data)
}
async function createApplication() {
  const projectId = generateRandomNumber();
  const params = {
    projectId ,
    "name": "文件" + projectId,
    "createdAt": "2024-10-1",
    "updatedAt": "2024-11-4"
  }
  const data = await modelService.createApplicationProject(params)
  console.log('data:',data)
}
</script>

<template>
  <GraphView/>
  <HelloWorld msg="Vite + Vue" />
  <button @click="createApplication">创建应用项目</button>
  <button  >创建项目</button>
  <button @click="getApplication">获取项目</button>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
