<script setup lang="ts">
import { onMounted } from 'vue'
import { GraphView } from '@hfdraw/graph'
// @ts-ignore
import { modelService } from '@/util/ModelService'
// @ts-ignore
import { generateRandomNumber } from '@/util/common'

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

async function createProject() {
  const projectId = generateRandomNumber();
  const params = {
    "name": "项目1" 
  }
  const data = await modelService.createProject(params)
  console.log('创建项目结果:', data)
}
</script>

<template>
  <div class="v-app-container">
    <button @click="createProject">创建项目</button>
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
