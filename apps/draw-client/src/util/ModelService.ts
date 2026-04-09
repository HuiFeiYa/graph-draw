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
    async createProject(params: any) {
        const res = await httpClient.post<{data:any}>(API.projectCreate, params)
        return res.data
    }
    async exportTemplate(params: { projectId: string; name: string; description?: string }) {
        const res = await httpClient.post<{data:any}>(API.exportTemplate, params)
        return res.data
    }
    async getTemplateList() {
        const res = await httpClient.get<{data:any}>(API.templateList)
        return res.data
    }
    async applyTemplate(params: { projectId: string; templateId: number }) {
        const res = await httpClient.post<{data:any}>(API.applyTemplate, params)
        return res.data
    }
}

export const modelService = new ModelService();