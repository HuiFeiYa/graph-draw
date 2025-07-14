import { ShapeEntity } from 'src/entities/shape.entity';
import { generateRectConnectRoute } from '@hfdraw/elbow';

export class EdgeWaypointUtil {
    // fix: 自动调整所有相关联的边线例如：shape 的 resize 和 move 以后再次快速创建图形时位置不对
  static async updateConnectedEdgesForShape(
    shape: ShapeEntity,
    stepManager: any,
    shapeMap?: Map<string, ShapeEntity>
  ): Promise<ShapeEntity[]> {
    const edges = await stepManager.shapeRep.find({
      where: [
        { sourceId: shape.id },
        { targetId: shape.id }
      ]
    });
    const updatedEdges = [];
    for (const edge of edges) {
      const isSource = edge.sourceId === shape.id;
      const isTarget = edge.targetId === shape.id;
      let sourceShape = isSource ? shape : (shapeMap?.get(edge.sourceId) || await stepManager.shapeRep.findOne({ where: { id: edge.sourceId } }));
      let targetShape = isTarget ? shape : (shapeMap?.get(edge.targetId) || await stepManager.shapeRep.findOne({ where: { id: edge.targetId } }));

      // fake 逻辑
      function fakeRect(point) {
        const fakeSize = 4, margin = 10, half = (fakeSize + margin) / 2;
        return { bounds: { absX: point.x - half, absY: point.y - half, width: fakeSize + margin, height: fakeSize + margin }, connection: [0.5, 0.5] };
      }
      const sourceRect = sourceShape
        ? { bounds: sourceShape.bounds, connection: edge.style?.sourceConnection || [0.5, 0.5] }
        : fakeRect(edge.waypoint?.[0]);
      const targetRect = targetShape
        ? { bounds: targetShape.bounds, connection: edge.style?.targetConnection || [0.5, 0.5] }
        : fakeRect(edge.waypoint?.[edge.waypoint.length - 1]);

      if (sourceRect && targetRect) {
        edge.waypoint = generateRectConnectRoute(sourceRect, targetRect, { routeType: 'elbow', margin: 30 });
        edge.waypointChanged = true;
        updatedEdges.push(edge);
      }
    }
    return updatedEdges;
  }
}