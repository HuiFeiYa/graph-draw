import { defineStore } from 'pinia';

export const useProjectStore = defineStore('project', {
  state: ():({
    projectId: string,
    projects: any[],
    currentProjectName: string,
    commonConfig: any
  }) => ({
    projects: [],
    projectId: '',
    currentProjectName: '',
    commonConfig: {}
  }),
  actions: {
    addProject(project: object) {
      this.projects.push(project);
    },
    setCurrentProjectId(projectId: string) {
      this.projectId = projectId; 
    },
    setCurrentProjectName(name: string) {
      this.currentProjectName = name
    },
    setCommonConfig(commonConfig: any) {
      this.commonConfig = commonConfig
    }
  },
});