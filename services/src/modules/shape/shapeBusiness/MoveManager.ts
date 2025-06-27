import { generateRectConnectRoute, getKeyPoints } from '@hfdraw/elbow';
import { SubShapeType, ElbowPoint, Bounds } from '@hfdraw/types';
import { waypointUtil } from '@hfdraw/utils';
import { ShapeEntity } from 'src/entities/shape.entity';
import { MoveShapeDto } from 'src/types/shape.dto';

export class MoveManager {
  /**
   * 更新移动的图形
   * @param shapeMap
   * @param dto
   * @returns
   */
  static updateShapes(
    shapeMap: Map<string, ShapeEntity>,
    dto: MoveShapeDto,
    updateShapeSet: Set<ShapeEntity>,
  ) {
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
          ...shape.nameBounds,
        };
        shape.nameBoundsChanged = true;
      }
      updateShapeSet.add(shape);
    });
  }

  static updateEdgeShapes(
    shapeMap: Map<string, ShapeEntity>,
    dto: MoveShapeDto,
    updateShapeSet: Set<ShapeEntity>,
  ) {
    const edges = [...shapeMap.values()].filter((shape) => {
      return shape.subShapeType === SubShapeType.CommonEdge;
    });
    for (const edge of edges) {
      if (
        dto.shapeIds.includes(edge.sourceId) ||
        dto.shapeIds.includes(edge.targetId)
      ) {
        const sourceShape = shapeMap.get(edge.sourceId);
        const targetShape = shapeMap.get(edge.targetId);
        this.updateWaypoint(edge, sourceShape, targetShape);
        updateShapeSet.add(edge);
      }
    }
  }
  static updateWaypoint(
    edge: ShapeEntity,
    sourceShape: ShapeEntity,
    targetShape: ShapeEntity,
  ) {
    if (!sourceShape && !targetShape) {
      return null;
    }

    try {
      const {
        style: { sourceConnection, targetConnection },
      } = edge;

      // 支持单端连线：只要有一端存在图形就可以生成路径
      if (sourceShape && targetShape) {
        // 双端连线：使用原有逻辑
        const sourcePoints: ElbowPoint[] = [
          [sourceShape.bounds.x, sourceShape.bounds.y],
          [
            sourceShape.bounds.x + sourceShape.bounds.width,
            sourceShape.bounds.y + sourceShape.bounds.height,
          ],
        ];
        const targetPoints: ElbowPoint[] = [
          [targetShape.bounds.x, targetShape.bounds.y],
          [
            targetShape.bounds.x + targetShape.bounds.width,
            targetShape.bounds.y + targetShape.bounds.height,
          ],
        ];

        const keyPoints = getKeyPoints(sourcePoints, targetPoints, {
          source: { connection: sourceConnection },
          target: { connection: targetConnection },
        });

        edge.waypoint = keyPoints.map((point) => ({
          x: point[0],
          y: point[1],
        }));
      } else if (sourceShape || targetShape) {
        // 单端连线：移动图形时保持另一端位置不变
        const existingShape = sourceShape || targetShape;
        const isSource = !!sourceShape;
        const connection = isSource ? sourceConnection : targetConnection;

        // 获取现有waypoint，如果没有则使用默认值
        const currentWaypoint = edge.waypoint || [];

        // 创建移动图形的连接点
        const movingRect = {
          bounds: {
            absX: existingShape.bounds.x,
            absY: existingShape.bounds.y,
            x: existingShape.bounds.x,
            y: existingShape.bounds.y,
            width: existingShape.bounds.width,
            height: existingShape.bounds.height,
          },
          connection: connection,
        };

        // 计算移动图形的新连接点

        if (currentWaypoint.length >= 2) {
          // 如果已有waypoint，保持另一端不变，只更新移动端
          let startRectConnectPoint: {
            bounds: Bounds;
            connection: [number, number];
          };
          let endRectConnectPoint: {
            bounds: Bounds;
            connection: [number, number];
          };
          const fakeSize = 4;
          if (isSource) {
            // 移动的是源图形，保持目标端不变
            const endPoint = currentWaypoint[currentWaypoint.length - 1];
            // 目标图形基于线段的末端 fake 一个图形，作为一个点计算位置
            endRectConnectPoint = {
              bounds: new Bounds(
                endPoint.x - fakeSize / 2,
                endPoint.y - fakeSize / 2,
                fakeSize,
                fakeSize,
                endPoint.x - fakeSize / 2,
                endPoint.y - fakeSize / 2,
              ),
              connection: [0.5, 0.5],
            };
            startRectConnectPoint = movingRect;
          } else {
            const startPoint = currentWaypoint[0];
            startRectConnectPoint = {
              bounds: new Bounds(
                startPoint.x - fakeSize / 2,
                startPoint.y - fakeSize / 2,
                fakeSize,
                fakeSize,
                startPoint.x - fakeSize / 2,
                startPoint.y - fakeSize / 2,
              ),
              connection: [0.5, 0.5],
            };
            endRectConnectPoint = movingRect;
          }

          const previewBounds = generateRectConnectRoute(
            startRectConnectPoint,
            endRectConnectPoint,
            {
              routeType: 'elbow',
              margin: 30,
            },
          );

          edge.waypoint = previewBounds;
        }
      }

      edge.waypointChanged = true;
    } catch (error) {
      console.error('Error updating waypoint:', error);
      // 发生错误时使用简单的默认路径
      const shape = sourceShape || targetShape;
      if (shape) {
        const centerX = shape.bounds.x + shape.bounds.width / 2;
        const centerY = shape.bounds.y + shape.bounds.height / 2;
        edge.waypoint = [
          { x: centerX, y: centerY },
          { x: centerX + 100, y: centerY },
        ];
        edge.waypointChanged = true;
      }
    }
  }

  /**
   * 根据连接点配置计算实际的连接点坐标
   */
  private static getActualConnectionPoint(rectConnect: any): ElbowPoint {
    const { bounds, connection } = rectConnect;

    // 如果连接点是中心点或者矩形足够小，使用中心点
    if (
      (connection[0] === 0.5 && connection[1] === 0.5) ||
      (bounds.width <= 20 && bounds.height <= 20)
    ) {
      return [bounds.absX + bounds.width / 2, bounds.absY + bounds.height / 2];
    }

    // 根据连接点比例计算实际坐标
    return [
      bounds.absX + bounds.width * connection[0],
      bounds.absY + bounds.height * connection[1],
    ];
  }
}
