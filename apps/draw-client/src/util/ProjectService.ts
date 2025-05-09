import { httpClient } from '../util/httpClient';
import { API } from '../constants/api';

export class ProjectService {
    async getUnCloseProjectList() {
        const res = await httpClient.get<{data: any}>(API.projectList);
        return res.data;
    }
    async getProjectList() {
        const res = await httpClient.get<{data: any}>(API.projectList);
        return res.data;
    }
    async saveProject(projectId: string) {
        await httpClient.post(API.projectSave, { projectId });
    }
}

export const projectService = new ProjectService();