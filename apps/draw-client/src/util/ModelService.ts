import { httpClient } from './httpClient'
import { API } from '../constants/api'
export class ModelService {
    async getApplicationProject() {
        const res = await httpClient.get(API.get_application_project)
        return res.data
    }
    async createApplicationProject(data) {
        const res = await httpClient.post(API.create_application_project, data)
        return res.data
    }
    async getProject() {
        const res = await httpClient.get(API.get_application_project)
        return res.data
    }
    async createProject(data) {
        const res = await httpClient.post(API.projectCreate, data)
        return res.data
    }
}

export const modelService = new ModelService();