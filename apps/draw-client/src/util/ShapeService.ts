import { httpClient } from './httpClient'
import { API } from '../constants/api'
import { SideBarDropDto } from '../types/shape.dto'
import { Shape } from '@hfdraw/types'
export class ShapeService {
    async sidebarDrop(data: SideBarDropDto) {
        const res = await httpClient.post(API.sidebarDrop, data)
    }
    async getAllShapes(projectId: string) {
        const res = await httpClient.get<{data: {data: Shape[]}}>(API.getAllShapes, {projectId})
        return res.data.data;
    }
}
export const shapeService = new ShapeService();