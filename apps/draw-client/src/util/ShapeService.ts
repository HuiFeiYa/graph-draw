import { httpClient } from './httpClient'
import { API } from '../constants/api'
import { ConnectShapeAndCreateDto, MoveShapeDto, SideBarDropDto } from '../types/shape.dto'
import { Shape } from '@hfdraw/types'
import { AxiosResponse } from 'axios';
import { Point } from '@hfdraw/graph/src/util/Point';

export class ShapeService {
    async sidebarDrop(data: SideBarDropDto) {
        const res = await httpClient.post(API.sidebarDrop, data)
    }
    async getAllShapes(projectId: string) {
        const res = await httpClient.get<{data: {data: Shape[]}}>(API.getAllShapes, {projectId})
        return res.data.data;
    }
    async moveShape(dto: MoveShapeDto) {
        await httpClient.post(API.moveShapes, dto)
    }
    async redo(projectId: string) {
        await httpClient.post(API.redo, {projectId})
    }
    async clear(projectId: string) {
        await httpClient.post(API.clear, {projectId})
    }
    async undo(projectId: string) {
        await httpClient.post(API.undo, {projectId})
    }
    async getStepStatus(projectId: string) {
        const res = await httpClient.get<AxiosResponse<{data: {currentStepId: string, hasPreStep: boolean, hasNextStep: boolean}}>>(API.stepStatus, {projectId})
        return res.data.data;
    }
    async connectShapeAndCreate(dto: ConnectShapeAndCreateDto) {
        await httpClient.post(API.connectShapeAndCreate, dto);
    }

    async moveEdge(params: {shapeId: string, waypoint: Point[], projectId: string}) {
        await httpClient.post(API.moveEdge, params);
    }
}
export const shapeService = new ShapeService();