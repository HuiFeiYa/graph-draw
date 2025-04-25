import { httpClient } from '../util/httpClient';
import { API } from '../constants/api';

export class ProjectService {
    async getProjectList() {
        const res = await httpClient.get<{data: any}>(API.projectList);
        return res.data;
    }
}

export const projectService = new ProjectService();