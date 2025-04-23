import { httpClient } from './httpClient'
import { API } from '../constants/api'
export class ModelService {
    async getApplicationProject() {
        const res = await httpClient.get<{data:any}>(API.get_application_project)
        return res.data
    }
    async createApplicationProject(data: Object | undefined) {
        const res = await httpClient.post<{data:any}>(API.create_application_project, data)
        return res.data
    }
    async getProject() {
        const res = await httpClient.get<{data:any}>(API.get_application_project)
        return res.data
    }
    async createProject(name: string) {
        const res = await httpClient.post<{data:any}>(API.projectCreate, { name })
        return res.data
    }
}

export const modelService = new ModelService();