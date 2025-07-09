<template>
  <el-dialog v-model="dialogVisible" title="新建项目">
    <el-input v-model="projectName" placeholder="请输入项目名称" />
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="handleCreate">创建</el-button>
    </template>
  </el-dialog>
  <div class="project-list-container">
    <div class="sidebar">
      <button class="sidebar-btn" @click="openDialog">
        <span class="btn-icon">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 1V15M1 8H15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </span>
        新建
      </button>
      <button class="sidebar-btn">
        <span class="btn-icon">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 9L8 3L14 9M8 4V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
        从模板新建
      </button>
      <button class="sidebar-btn">
        <span class="btn-icon">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 15L8 12L13 15V3C13 2.46957 12.7893 1.96086 12.4142 1.58579C12.0391 1.21071 11.5304 1 11 1H5C4.46957 1 3.96086 1.21071 3.58579 1.58579C3.21071 1.96086 3 2.46957 3 3V15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
        我的收藏
      </button>
      <button class="sidebar-btn">
        <span class="btn-icon">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 4H14M5 4V3C5 2.46957 5.21071 1.96086 5.58579 1.58579C5.96086 1.21071 6.46957 1 7 1H9C9.53043 1 10.0391 1.21071 10.4142 1.58579C10.7893 1.96086 11 2.46957 11 3V4M13 4V13C13 13.5304 12.7893 14.0391 12.4142 14.4142C12.0391 14.7893 11.5304 15 11 15H5C4.46957 15 3.96086 14.7893 3.58579 14.4142C3.21071 14.0391 3 13.5304 3 13V4H13Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
        回收站
      </button>
      <!-- 添加服务连接状态显示 -->
      <div class="server-status">
        <div class="status-indicator" :class="{ 'connected': serverStatus.isRunning, 'disconnected': !serverStatus.isRunning }">
          <span class="status-dot"></span>
          <span class="status-text">{{ serverStatus.isRunning ? '服务已连接' : '服务未连接' }}</span>
        </div>
        <button class="connect-btn" @click="toggleServerConnection" :disabled="serverStatus.loading">
          {{ serverStatus.isRunning ? '断开服务' : '连接服务' }}
        </button>
      </div>
    </div>
    <div class="main-content">
      <h1>项目列表</h1>
      <div class="project-grid">
        <template v-if="projects?.length">
          <div v-for="project in projects" :key="project.id" class="project-card">
            <div class="project-info">
              <h3>{{ project.name }}</h3>
              <p class="project-type">{{ project.type === 'flowchart' ? '流程图' : '思维导图' }}</p>
            </div>
            <div class="project-actions">
              <button class="open-btn" @click="openProject(project)">打开项目</button>
              <button class="delete-btn" @click="deleteProject(project.projectId)">删除项目</button>
            </div>
          </div>
        </template>
        <div v-else class="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#A0AEC0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="#A0AEC0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="#A0AEC0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <p>暂无项目，快去创建一个吧！</p>
          <button class="create-btn" @click="createNewProject">创建项目</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { projectService } from '../util/ProjectService'
import { modelService } from '../util/ModelService'
import { socketService } from '../socket/SocketService'
import { useProjectStore } from '../stores/project' 
import { ElDialog, ElInput, ElButton } from 'element-plus'

const router = useRouter()

// 模拟项目数据，实际应从API获取
const projects = ref()
const projectStore = useProjectStore(); // 初始化 store

// 服务状态
const serverStatus = ref({
  isRunning: false,
  loading: false
})

const openProject = (p:any) => {
  const projectId = p.projectId
  const projectName = p.name
  // 根据项目类型跳转到对应页面
  const project = projects.value.find(p => p.projectId === projectId)
  if (project) {
    router.push({ path: '/layout/flow', query: { projectId, projectName } })
  } else {
    router.push({ path: '/layout/mindMap',query: { projectId, projectName } })
  }
}

const getProjects = async () => {
    projectService.getProjectList().then(res => {
      projects.value = res.data
    })
}

const createNewProject = async() => {
    const params = {
    "name": projectName.value
  }
  console.log('openDevTools menu')
      window.electron.openDevTools();
  const data = await modelService.createProject(params)
  console.log('创建项目结果:', data)
  if (data.code === 1000) {
    // projectStore.addProject(data.data.projectId); // 将 projectId 添加到 store
    const projectId = data.data.projectId;
    projectStore.setCurrentProjectId(projectId);
    socketService.sendJSON({ type: 'subscribeProject', projectId });
    getProjects()
    router.push({ path: '/layout/flow', query: { projectId, projectName: projectName.value } })

  }
}

// 切换服务连接状态
const toggleServerConnection = async () => {
  serverStatus.value.loading = true
  try {
    if (serverStatus.value.isRunning) {
      // 断开服务
      const result = await window.electron.stopNodeServer()
      if (result.success) {
        serverStatus.value.isRunning = false
        console.log('服务已断开')
      } else {
        console.error('断开服务失败:', result.message)
      }
    } else {
      // 连接服务
      const result = await window.electron.startNodeServer()
      if (result.success) {
        serverStatus.value.isRunning = true
        console.log('服务已连接')
      } else {
        console.error('连接服务失败:', result.message)
      }
    }
  } catch (error) {
    console.error('操作服务时出错:', error)
  } finally {
    serverStatus.value.loading = false
  }
}

// 获取服务状态
const getServerStatus = async () => {
  try {
    const status = await window.electron.getNodeServerStatus()
    serverStatus.value.isRunning = status.isRunning
  } catch (error) {
    console.error('获取服务状态失败:', error)
  }
}

const dialogVisible = ref(false)
const projectName = ref('')
const openDialog = () => {
  dialogVisible.value = true
  projectName.value = ''
}
const handleCreate = async () => {
  if (!projectName.value) return
  dialogVisible.value = false
  const params = { name: projectName.value }
  const data = await modelService.createProject(params)
  if (data.code === 1000) {
    const projectId = data.data.projectId
    projectStore.setCurrentProjectId(projectId)
    projectStore.setCurrentProjectName(projectName.value)
    socketService.sendJSON({ type: 'subscribeProject', projectId })
    getProjects()
    router.push({ path: '/layout/flow', query: { projectId } })
  }
}

onMounted(() => {
    getProjects()
    getServerStatus() // 获取初始服务状态
})

const deleteProject = async (projectId) => {
  if (confirm('确定要删除该项目吗？')) {
      const res = await projectService.deleteProject(projectId)
        getProjects()
    
   
  }
}
</script>

<style scoped>
.project-list-container {
  display: flex;
  height: 100vh;
  background: #f5f7fa;
}

.sidebar {
  width: 200px;
  padding: 2rem 1rem;
  background: white;
  border-right: 1px solid #eee;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.sidebar-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  width: 100%;
}

.sidebar-btn:hover {
  background: #f0f2f5;
  color: #2196F3;
}

.btn-icon {
  font-size: 1.2rem;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 服务状态样式 */
.server-status {
  margin-top: auto;
  padding: 1rem;
  border-top: 1px solid #eee;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #dc3545;
}

.status-indicator.connected .status-dot {
  background: #28a745;
}

.status-text {
  font-size: 0.875rem;
  color: #666;
}

.connect-btn {
  width: 100%;
  padding: 0.5rem;
  border: none;
  border-radius: 4px;
  background: #2196F3;
  color: white;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.connect-btn:hover:not(:disabled) {
  background: #0b7dda;
}

.connect-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.main-content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

.main-content h1 {
  margin-bottom: 2rem;
  color: #333;
  font-weight: 500;
}

.project-grid {
    display: flex;
    flex-wrap: wrap;
}

.project-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1rem;
  width: 300px;
  margin-right: 10px;
  margin-bottom: 10px;
}

.project-card:hover {
  box-shadow: 0 2px 8px rgba(33, 150, 243, 0.15);
}

.project-info {
  flex: 1;
}

.project-card h3 {
  margin: 0 0 0.5rem;
  color: #333;
  font-size: 1rem;
  font-weight: 500;
}

.project-type {
  color: #666;
  font-size: 0.875rem;
  margin: 0;
}

.unnamed-file {
  background: #f5f7fa;
}

.unnamed-file h3 {
  color: #e57373;
}

.open-btn {
  width: 100%;
  padding: 15px 10px;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
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

.empty-state {
  width: 100%;
  padding: 4rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.empty-state p {
  color: #666;
  font-size: 1rem;
  margin: 0;
}

.create-btn {
  padding: 0.75rem 2rem;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.create-btn:hover {
  background: #0b7dda;
  transform: translateY(-1px);
}
.project-actions {
  display: flex;
  gap: 0.5rem;
}

.delete-btn {
  width: 100%;
  padding: 0.75rem;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}

.delete-btn:hover {
  background: #c82333;
}
</style>