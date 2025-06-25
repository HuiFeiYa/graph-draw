import { Bounds, ElbowPoint, IPoint, Shape, ShapeType, StyleObject } from "@hfdraw/types";
import { rightAngleEdgeUtil } from "./RightAngleEdgeUtil";


export class WaypointUtil {

    /**
     * 根据线的style和waypoint生成svgpath
     * @param edgeShape
     */
    getSvgPath(edgeShape: Shape): string {
        // 开始路径的命令
        let path = "M" + edgeShape.waypoint[0].x + " " + edgeShape.waypoint[0].y;

        // 遍历点数组，添加直线命令
        for (let i = 1; i < edgeShape.waypoint.length; i++) {
            path += " L" + edgeShape.waypoint[i].x + " " + edgeShape.waypoint[i].y;
        }

        return path;
    }


    getPointsPath(waypoints: IPoint[]) {
        let path = "M" + waypoints[0].x + " " + waypoints[0].y;
         // 遍历点数组，添加直线命令
         for (let i = 1; i < waypoints.length; i++) {
            path += " L" + waypoints[i].x + " " + waypoints[i].y;
        }

        return path;
    }
    /**
     * 合并连续的共线点，只保留起点和终点
     * 例如: [(x1,y), (x2,y), (x3,y)] -> [(x1,y), (x3,y)]
     * @param points 原始点数组
     * @returns 合并后的点数组
     */
    mergeCollinearPoints(points: IPoint[]): IPoint[] {
        if (points.length <= 2) {
            return points;
        }

        const result: IPoint[] = [points[0]];
        let i = 1;

        while (i < points.length) {
            const current = points[i];
            const prev = result[result.length - 1];
            
            // 查找连续的共线点
            let j = i + 1;
            while (j < points.length) {
                const next = points[j];
                
                // 检查三点是否共线（水平或垂直）
                const isHorizontal = prev.y === current.y && current.y === next.y;
                const isVertical = prev.x === current.x && current.x === next.x;
                
                if (isHorizontal || isVertical) {
                    j++;
                } else {
                    break;
                }
            }
            
            // 如果找到了连续的共线点，只添加最后一个点
            if (j > i + 1) {
                result.push(points[j - 1]);
                i = j;
            } else {
                result.push(current);
                i++;
            }
        }

        return result;
    }

     /**
   * 前端连线时，生成预览线的waypoint
   * @param shapeMap
   * @param edgeStyle
   * @param sourceShape 起点图形
   * @param targetPoint 目标点
   * @param targetShape 终点图形，可能不传，表示当前没有可连接的目标图形
   * @returns
   */
  generateConnectPreviewWaypoint(shapeMap: Map<string, Shape>, edgeStyle: StyleObject, sourceShape: Shape | undefined, targetPoint: IPoint, targetShape?: Shape, sourcePoint?: IPoint): IPoint[] {
      return rightAngleEdgeUtil.generateConnectPreviewWaypoint(shapeMap, edgeStyle, sourceShape, targetPoint, targetShape, sourcePoint);
  }
}

export const waypointUtil = new WaypointUtil();