import { httpClient } from './httpClient'
import { API } from '../constants/api'
import { SideBarDropDto } from '../types/shape.dto'
export class ShapeService {
    async sidebarDrop(data: SideBarDropDto) {
        const res = await httpClient.post(API.sidebarDrop, data)
    }
}
export const shapeService = new ShapeService();