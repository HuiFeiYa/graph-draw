import { httpClient } from './httpClient'
import { API } from '../constants/api'
import { ChangeRelationshipEndsDto, ConnectShapeAndCreateDto, MoveShapeDto, SideBarDropDto } from '../types/shape.dto'
import { Bounds, IBounds, Shape, StyleObject } from '@hfdraw/types'
import { AxiosResponse } from 'axios';
// @ts-nocheck
import { Point } from '@hfdraw/graph/src/util/Point';
import { ResData } from './common';

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

    async moveEdge(params: {shapeId: string, waypoint: Point[], projectId: string,styleObject?: StyleObject, sourceId?:string, targetId?:string}) {
        await httpClient.post(API.moveEdge, params);
    }
    async moveSegment(params: {shapeId: string, waypoint: Point[], projectId: string}) {
        await httpClient.post(API.moveSegment, params);
    }
    async updateShapeStyle(data: {styleObject: StyleObject, projectId: string, shapeId: string}) {
        await httpClient.post(API.updateShapeStyle,data)
    }
    async createMindMapRect(data: {shapeId: string, diagramId: string, depth: number, projectId: string}) {
        await httpClient.post(API.createMindMapRect, data)
    }
    async saveText(data: {shapeId: string,text: string, projectId: string}) {
        await httpClient.post(API.saveText, data)
    }
    async expandShape(data: {shapeId: string, expand: boolean, projectId: string}) {
        await httpClient.post(API.expandShape, data)
    }
    async resizeShape(data: {shapeId: string, bounds: Bounds, projectId: string}) {
        await httpClient.post(API.resizeShape, data)
    }
    async getResizeMinimumBounds(projectId: string,  shapeId: string, vertexType: number): Promise<ResData<Bounds>> {
        return httpClient.post(API.SHAPE_MINIMUM_BOUNDS,{  shapeId, projectId, vertexType }).then((res:any) => res.data);
    }
    async changeRelationshipEnds(dto: ChangeRelationshipEndsDto) {
        await httpClient.post(API.RELATIONSHIP_CHANGERELATIONSHIPENDS, dto);
      }

    async batchUpdateShapeStyle(data: { projectId: string, shapeIds: string[], styleObject: StyleObject }) {
        await httpClient.post(API.batchUpdateShapeStyle, data)
    }
    
    // zIndex 相关方法
    async moveZIndexUp(data: { projectId: string, shapeId: string }) {
        await httpClient.post(API.moveZIndexUp, data)
    }
    
    async moveZIndexDown(data: { projectId: string, shapeId: string }) {
        await httpClient.post(API.moveZIndexDown, data)
    }
    
    async moveZIndexToTop(data: { projectId: string, shapeId: string }) {
        await httpClient.post(API.moveZIndexToTop, data)
    }
    
    async moveZIndexToBottom(data: { projectId: string, shapeId: string }) {
        await httpClient.post(API.moveZIndexToBottom, data)
    }
    
}
export const shapeService = new ShapeService();