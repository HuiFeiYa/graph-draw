import { defineStore } from 'pinia';

export const useProjectStore = defineStore('project', {
  state: (): {
    projects: any[]
  } => ({
    projects: []
  }),
  actions: {
    addProject(project: object) {
      this.projects.push(project);
    },
  },
});