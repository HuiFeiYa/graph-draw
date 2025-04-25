<template>
  <div class="project-list-container">
    <h1>项目列表</h1>
    <div class="project-grid">
      <div v-for="project in projects" :key="project.id" class="project-card">
        <h3>{{ project.name }}</h3>
        <p class="project-type">{{ project.type === 'flowchart' ? '流程图' : '思维导图' }}</p>
        <button class="open-btn" @click="openProject(project.id)">打开项目</button>
      </div>
      <div class="create-card" @click="createNewProject">
        <div class="plus-icon">+</div>
        <p>创建新项目</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 模拟项目数据，实际应从API获取
const projects = ref([
  { id: 1, name: '示例项目1', type: 'flowchart' },
  { id: 2, name: '示例项目2', type: 'mindmap' },
])

const openProject = (projectId: number) => {
  // 根据项目类型跳转到对应页面
  const project = projects.value.find(p => p.id === projectId)
  if (project?.type === 'flowchart') {
    router.push({ name: 'flow' })
  } else {
    router.push({ name: 'mindMap' })
  }
}

const createNewProject = () => {
  router.push({ name: 'CreateProject' })
}
</script>

<style scoped>
.project-list-container {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 2rem;
}

h1 {
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
  font-weight: 500;
}

.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 2rem;
}

.project-card, .create-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
}

.project-card:hover, .create-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}

.project-card h3 {
  margin: 0 0 0.5rem;
  color: #333;
}

.project-type {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.open-btn {
  width: 100%;
  padding: 0.75rem;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}

.open-btn:hover {
  background: #0b7dda;
}

.create-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 2px dashed #ddd;
  background: #f9f9f9;
}

.plus-icon {
  font-size: 2.5rem;
  color: #2196F3;
  margin-bottom: 0.5rem;
}

.create-card p {
  color: #666;
  margin: 0;
}
</style>