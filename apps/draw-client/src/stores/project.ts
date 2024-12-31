import { defineStore } from 'pinia';

export const useProjectStore = defineStore('project', {
  state: ():({
    projectId: string,
    projects: any[]
  }) => ({
    projects: [],
    projectId: 'p1'
  }),
  actions: {
    addProject(project: object) {
      this.projects.push(project);
    },
  },
});