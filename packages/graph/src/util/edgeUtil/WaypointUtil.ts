import { Shape } from "@hfdraw/types";

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
}

export const waypointUtil = new WaypointUtil();