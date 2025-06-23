import { Point } from "./Point";
import { ShapeEntity } from "src/entities/shape.entity";
import { shapeUtil } from "./shape/ShapeUtil";
import { getLineCenter } from "./shape/Line";

type ShapeMap = Map<string, ShapeEntity>
export class WaypointModel {
      /**
   * 更新线的waypoint，传入的waypoint经过计算处理后才设置为线的waypoint
   * 同时调整线的label的坐标
   * @param shapeMap
   * @param edgeShape
   * @param newWayPoint
   * @returns 受影响的图形， 变化的属性被标记为changed，返回原始Shape（shapeMap里的shape，而不是复制的或者重新查询出来的shape）
   */
  updateWaypoint(shapeMap:Map<string, ShapeEntity>, edgeShape:ShapeEntity, newWayPoint:Point[]):ShapeEntity[] {
    edgeShape.waypoint = newWayPoint;
    edgeShape.waypointChanged = true;
    // WaypointChecker.checkAll(edgeShape, shapeMap);

    return [edgeShape];
  }
  adjustEdgeRelatedEdges(shapeMap: ShapeMap, projectId:string, edgeShapeId:string, relatedEdges?:Set<ShapeEntity>) {
    // 是有有其他线的两端是这条线edgeShape， 如果有的话要调整这些线
    const edgeShape = shapeMap.get(edgeShapeId);
    if (!relatedEdges) {
      relatedEdges = shapeUtil.getEndToEdge(shapeMap, projectId, edgeShape.id);

    }
    const affectedShapes = new Set<ShapeEntity>();

    if (relatedEdges.size) {
      const center = getLineCenter(edgeShape.waypoint);
      relatedEdges.forEach(item => {
        if (item.sourceId === edgeShape.id) {
          this.moveEdgeSourcePoint(item, center);

        } else {
          this.moveEdgeTargetPoint(item, center);
        }

        if (item.waypointChanged) {
        //   WaypointChecker.checkAll(item, shapeMap);
          affectedShapes.add(item);
        //   const affects3 = shapeUtil.freshEdgeLabel(item);
        //   affectedShapes.addAll(affects3);
        }
      });
    }
    return affectedShapes;
  }


  moveEdgeSourcePoint(edgeShape:ShapeEntity, point:Point) {
    if (Point.isSame(edgeShape.waypoint[0], point)) {
      return;
    }

    if (edgeShape.style.rightAngle) {
      // todo
      const startWithVertical = edgeShape.waypoint[0].x === edgeShape.waypoint[1].x;
      edgeShape.waypoint[0] = point;
      if (startWithVertical) {
        edgeShape.waypoint[1].x = point.x;
      } else {
        edgeShape.waypoint[1].y = point.y;
      }
    } else {
      edgeShape.waypoint[0] = point;

    }
    edgeShape.waypointChanged = true;
  }

  moveEdgeTargetPoint(edgeShape:ShapeEntity, point:Point) {
    const lastPoint = edgeShape.waypoint[edgeShape.waypoint.length - 1];
    if (Point.isSame(lastPoint, point)) {
      return;
    }

    if (edgeShape.style.rightAngle) {
      // todo

      const startWithVertical = edgeShape.waypoint[edgeShape.waypoint.length - 1].x === edgeShape.waypoint[edgeShape.waypoint.length - 2].x;
      edgeShape.waypoint[edgeShape.waypoint.length - 1] = point;
      if (startWithVertical) {
        edgeShape.waypoint[edgeShape.waypoint.length - 2].x = point.x;
      } else {
        edgeShape.waypoint[edgeShape.waypoint.length - 2].y = point.y;
      }

    } else {
      edgeShape.waypoint[edgeShape.waypoint.length - 1] = point;

    }
    edgeShape.waypointChanged = true;
  }
}

export const waypointModel = new WaypointModel();