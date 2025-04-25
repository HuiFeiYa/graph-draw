<script setup lang="ts">
import { socketService } from './socket/SocketService' // 引入 socketService
// @ts-ignore
import { modelService } from '@/util/ModelService'
// @ts-ignore
import { useProjectStore } from './stores/project' // 引入 useProjectStore

const projectStore = useProjectStore(); // 初始化 store

async function createProject() {
  const params = {
    "name": "项目1" 
  }
  const data = await modelService.createProject(params)
  console.log('创建项目结果:', data)
  if (data.code === 1000) {
    // projectStore.addProject(data.data.projectId); // 将 projectId 添加到 store
    const projectId = data.data.projectId;
    projectStore.setCurrentProjectId(projectId);
    socketService.sendJSON({ type: 'subscribeProject', projectId });
  }
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
