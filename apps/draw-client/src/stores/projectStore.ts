import { defineStore } from 'pinia'

export const useProjectStore = defineStore('project', {
  state: () => ({
    projectId: 'p2'
  }),
  getters: {
    getProjectId: (state) => state.projectId
  }
})