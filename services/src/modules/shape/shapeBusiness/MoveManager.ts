import { getKeyPoints } from "@hfdraw/elbow";
import { Point } from "@hfdraw/elbow/util/common-type";
import { ShapeKey, SubShapeType } from "@hfdraw/types";
import { ShapeEntity } from "src/entities/shape.entity";
import { MoveShapeDto } from "src/types/shape.dto";

export class MoveManager {
    /**
     * 更新移动的图形
     * @param shapeMap 
     * @param dto 
     * @returns 
     */
    static updateShapes(shapeMap: Map<string, ShapeEntity>, dto: MoveShapeDto, updateShapeSet: Set<ShapeEntity>) {
        
        dto.shapeIds.forEach((shapeId) => {
            // 直接更新 shapeMap 值
            const shape = shapeMap.get(shapeId);
            if (!shape) {
                console.warn(`Shape with id ${shapeId} not found in shapeMap`);
                return;
            }
            if (!shape.bounds) {
                console.warn(`Shape with id ${shapeId} has no bounds property`);
                return;
            }
            shape.bounds.x += dto.dx;
            shape.bounds.y += dto.dy;
            shape.bounds.absX += dto.dx;
            shape.bounds.absY += dto.dy;
            shape.boundsChanged = true;
            const newBounds = shape.bounds;
            if (shape.nameBounds) {
                shape.nameBounds = {
                  absX: newBounds.absX + shape.nameBounds.x,
                  absY: newBounds.absY + shape.nameBounds.y,
                  ...shape.nameBounds
                };
                shape.nameBoundsChanged = true;
              }
            updateShapeSet.add(shape);
        });
    }

    static async updateEdgeShapes(shapeMap: Map<string, ShapeEntity>, dto: MoveShapeDto, updateShapeSet: Set<ShapeEntity>) {
        const edges = [...shapeMap.values()].filter(shape => {
            return shape.subShapeType === SubShapeType.CommonEdge 
        });
         edges.forEach(async (edge)=> {
            if (dto.shapeIds.includes(edge.sourceId) || dto.shapeIds.includes(edge.targetId)) {
                const sourceShape = shapeMap.get(edge.sourceId);
                const targetShape = shapeMap.get(edge.targetId);
                this.updateWaypoint(edge, sourceShape, targetShape)
                updateShapeSet.add(edge);
            }
        })
      
    }
    static updateWaypoint(edge:ShapeEntity, sourceShape: ShapeEntity, targetShape:ShapeEntity) {
        if (!sourceShape || !targetShape) {
            return null
        }
        const { x: x1, y: y1, width: w1, height: h1} = sourceShape.bounds;
        const { x: x2, y: y2, width: w2, height: h2} = targetShape.bounds;
        const sourcePoints: Point[] = [
            [x1, y1],
            [x1 + w1, y1 + h1]
        ]
        const targetPoints: Point[] = [
            [x2, y2],
            [x2 + w2, y2 + h2]
        ]
        const { style: { sourceConnection, targetConnection }} = edge;
        
        const keyPoints =  getKeyPoints(sourcePoints, targetPoints, { source: {connection:sourceConnection}, target: {connection: targetConnection}})
        const transformWaypoint =  keyPoints.map(point => {
            return {
                x: point[0],
                y: point[1]
            }
        });
        edge.waypoint = transformWaypoint
        edge.waypointChanged = true;
    }
}