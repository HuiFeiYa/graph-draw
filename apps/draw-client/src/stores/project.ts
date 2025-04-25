import { defineStore } from 'pinia';

export const useProjectStore = defineStore('project', {
  state: ():({
    projectId: string,
    projects: any[]
  }) => ({
    projects: [],
    projectId: ''
  }),
  actions: {
    addProject(project: object) {
      this.projects.push(project);
    },
    setCurrentProjectId(projectId: string) {
      this.projectId = projectId; 
    }
  },
});