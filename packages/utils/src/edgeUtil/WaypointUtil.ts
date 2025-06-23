import { ElbowPoint, Shape } from "@hfdraw/types";


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

    getPointsPath(waypoints: ElbowPoint[]) {
        let path = "M" + waypoints[0] + " " + waypoints[0];
         // 遍历点数组，添加直线命令
         for (let i = 1; i < waypoints.length; i++) {
            path += " L" + waypoints[i] + " " + waypoints[i];
        }

        return path;
    }

    /**
     * 合并连续的共线点，只保留起点和终点
     * 例如: [(x1,y), (x2,y), (x3,y)] -> [(x1,y), (x3,y)]
     * @param points 原始点数组
     * @returns 合并后的点数组
     */
    mergeCollinearPoints(points: ElbowPoint[]): ElbowPoint[] {
        if (points.length <= 2) {
            return points;
        }

        const result: ElbowPoint[] = [points[0]];
        let i = 1;

        while (i < points.length) {
            const current = points[i];
            const prev = result[result.length - 1];
            
            // 查找连续的共线点
            let j = i + 1;
            while (j < points.length) {
                const next = points[j];
                
                // 检查三点是否共线（水平或垂直）
                const isHorizontal = prev[1] === current[1] && current[1] === next[1];
                const isVertical = prev[0] === current[0] && current[0] === next[0];
                
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
//   generateConnectPreviewWaypoint(shapeMap: Map<string, Shape>, edgeStyle: StyleObject, sourceShape: Shape | undefined, targetPoint: ElbowPoint, targetShape?: Shape, sourcePoint?: ElbowPoint): ElbowPoint[] {
//     if (sourceShape?.shapeType === ShapeType.Edge) {
//       // 对于线上连线相当于在中点的一个width=0，height=0的矩形上连线
//       sourceShape.bounds = new Bounds(0, 0, 0, 0, sourcePoint?.x, sourcePoint?.y);
//     }
//     if (edgeStyle.rightAngle) {

//       return rightAngleEdgeUtil.generateConnectPreviewWaypoint(shapeMap, edgeStyle, sourceShape, targetPoint, targetShape, sourcePoint);

//     } else if (edgeStyle.edgeDirection === VerHor.horizontal) { // 水平线，如 Message
//       let d = new ElbowPoint(targetPoint.x, targetPoint.y);
//       if (sourceShape?.bounds && d.y < sourceShape.bounds.absY) {
//         d.y = sourceShape.bounds.absY;
//       }
//       if (sourceShape?.shapeType === ShapeType.Diagram) {
//         const dx = Math.abs(d.x - sourceShape?.bounds.absX);
//         let x: number = sourceShape.bounds.absX;
//         // 差值大于画布的一半，修改边框发出的方向
//         if (dx > sourceShape.bounds.width / 2) {
//           if (sourceShape.bounds.absX < d.x) {
//             // 左边框发出，起点改成右边框
//             x = sourceShape.bounds.absX + sourceShape.bounds.width;
//           } else {
//             // 右边框发出，起点改成左边框
//             x = sourceShape.bounds.absX;
//           }
//         }
//         return [new ElbowPoint(x, d.y), d];
//       } else if (sourceShape?.subShapeType === SubShapeType.CombinedFragment || sourceShape?.subShapeType === SubShapeType.InteractionUse) {
//         if (d.y >= sourceShape.bounds.absY + sourceShape.bounds.height) {
//           d.y = sourceShape.bounds.absY + sourceShape.bounds.height;
//         }
//       }
//       return [new ElbowPoint(sourceShape?.bounds.absX, d.y), d];
//     } else if (sourceShape?.shapeType === ShapeType.Edge) {

//       return sourcePoint ? [sourcePoint, targetPoint] : [];
//     } else {
//       return straightEdgeUtil.generateConnectPreviewWaypoint(shapeMap, edgeStyle, sourceShape, targetPoint, targetShape, sourcePoint);

//     }

//   }
}

export const waypointUtil = new WaypointUtil();