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

    async deleteProject(projectId: string) {
        await httpClient.post(API.projectDelete, { projectId });
    }

    async openProject(filePath: string) {
        const res = await httpClient.post<{data: any}>(API.projectOpen, { filePath });
        return res.data;
    }
    async getCommonConfig(projectId: string) {
        const res = await httpClient.get<{data: any}>(API.projectCommonConfig, { projectId });
        return res.data;
    }
    async updateCommonConfig(projectId: string, commonConfig: any) {    
        const res = await httpClient.post<{data: any}>(API.projectCommonConfig, { projectId, commonConfig });
        return res.data;
    }
}

export const projectService = new ProjectService();