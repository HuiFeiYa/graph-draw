<template>
  <div class="create-project-container">
    <h1>创建新项目</h1>
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="projectName">项目名称</label>
        <input 
          type="text" 
          id="projectName" 
          v-model="projectName" 
          required 
          placeholder="请输入项目名称"
        />
      </div>
      
      <div class="form-group">
        <label>项目类型</label>
        <div class="type-options">
          <button 
            type="button" 
            :class="{ active: projectType === 'flowchart' }"
            @click="projectType = 'flowchart'"
          >
            流程图
          </button>
          <button 
            type="button" 
            :class="{ active: projectType === 'mindmap' }"
            @click="projectType = 'mindmap'"
          >
            思维导图
          </button>
        </div>
      </div>
      
      <button type="submit" class="submit-btn">创建项目</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useProjectStore } from '../stores/project' // 引入 useProjectStore
import { modelService } from '../util/ModelService'
import { socketService } from '../socket/SocketService'

const projectStore = useProjectStore(); // 初始化 store
const router = useRouter()
const projectName = ref('')
const projectType = ref<'flowchart' | 'mindmap'>('flowchart')

const handleSubmit = () => {
  // 这里可以添加创建项目的API调用
  // 创建成功后根据类型跳转到不同页面
  if (projectType.value === 'flowchart') {
    router.push({ name: 'flow' })
  } else {
    router.push({ name: 'mindMap' })
  }
}

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

<style scoped>
.create-project-container {
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h1 {
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
  font-weight: 500;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #555;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

input:focus {
  outline: none;
  border-color: #2196F3;
  box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
}

.type-options {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
}

.type-options button {
  flex: 1;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

.type-options button:hover {
  border-color: #2196F3;
}

.type-options button.active {
  background: #2196F3;
  color: white;
  border-color: #2196F3;
}

.submit-btn {
  width: 100%;
  padding: 0.75rem;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 1rem;
}

.submit-btn:hover {
  background: #0b7dda;
  transform: translateY(-1px);
}

.submit-btn:active {
  transform: translateY(0);
}
</style>