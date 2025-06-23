/* eslint-disable prettier/prettier */
type ElbowPoint = [number, number];
interface ArrowConfig {
    distance: number;
    angle: number;
    size: number
}
interface DrawOptions {
    hasStartArrow?: boolean
    hasEndArrow?: boolean
}
export class PathBuilder {
    constructor(public arrowConfig: ArrowConfig) {

    }
    /**
     * 根据给定的点和选项绘制路径，并在指定位置添加箭头。
     * 
     * @param points - 要连接成路径的点数组。
     * @param options - 包含绘制选项的对象，如是否需要起始箭头和结束箭头等。
     * @returns 返回一个对象，包含路径数据（pathData）和箭头数据（arrowData）。
     */
    draw(points: ElbowPoint[], options: DrawOptions) {
        let pathData = '';
        let startArrow = '';
        let endArrow = '';
        const { distance, angle:arrowAngle, size} = this.arrowConfig;
        
        const trimPoints = this.connectPointsWithTrim(points,distance, options.hasStartArrow, options.hasEndArrow);
        if (options.hasEndArrow) {
            const angle = this.calculateArrowAngle(trimPoints[trimPoints.length - 2], trimPoints[trimPoints.length - 1]); 
            endArrow += this.calculateArrowPath(trimPoints[trimPoints.length - 1], angle, distance, arrowAngle, size);
        }
        if (options.hasStartArrow) {
            const angle = this.calculateArrowAngle(trimPoints[1],trimPoints[0]); 
            startArrow += this.calculateArrowPath(trimPoints[0], angle, distance, arrowAngle, size);
        }
        pathData= this.connectPoints(trimPoints);
        return {
            pathData, 
            startArrow,
            endArrow
        };
    }
    /**
     * 计算从 start 点到 end 点的箭头角度（以度为单位）。
     *
     * @param {Object} start - 起点坐标，包含 x 和 y 属性，例如 { x: 100, y: 0 }。
     * @param {Object} end - 终点坐标，包含 x 和 y 属性，例如 { x: 200, y: 0 }。
     * @returns {number} 箭头的角度，范围为 [0, 360) 度。
     */
    calculateArrowAngle(start: ElbowPoint, end: ElbowPoint) {
        // 计算两点之间的差值
        const deltaX = end[0] - start[0]; // X 轴方向的差值
        const deltaY = end[1] - start[1]; // Y 轴方向的差值

        // 使用 atan2 计算弧度
        const radian = Math.atan2(deltaY, deltaX); // 返回从 start 到 end 的方向弧度

        // 将弧度转换为角度
        const angle = radian * (180 / Math.PI); // 将弧度转换为度

        // 如果需要角度在 [0, 360) 范围内，可以加上 360 并取模
        const normalizedAngle = (angle + 360) % 360; // 确保角度在 [0, 360) 范围

        return normalizedAngle;
    }

    /**
     * 计算箭头的 SVG 路径。
     *
     * @param {Object} point - 箭头的顶点坐标 { x, y }。
     * @param {number} angle - 箭头的旋转角度（以度为单位）。
     * @param {number} distance - 箭头顶点到基线的距离。
     * @param {number} arrowAngle - 箭头的锐角（以度为单位）。
     * @param {number} size - 箭头的大小（箭头的长度）。
     * @returns {string} 箭头的 SVG 路径。
     */
    calculateArrowPath(point: ElbowPoint, angle: number, distance: number, arrowAngle: number, size: number) {
        // 将角度转换为弧度
        const rad = (deg: number) => deg * (Math.PI / 180);

        // 1. 计算顶点坐标
        const tipX = point[0] + size * Math.cos(rad(angle));
        const tipY = point[1] + size * Math.sin(rad(angle));

        // 2. 计算斜边端点
        const tipRad = rad(angle); // 顶点角度
        const halfTipAngleRad = rad(arrowAngle / 2); // 半锐角

        // 左侧端点
        const leftX = tipX - distance * Math.cos(tipRad - halfTipAngleRad);
        const leftY = tipY - distance * Math.sin(tipRad - halfTipAngleRad);

        // 右侧端点
        const rightX = tipX - distance * Math.cos(tipRad + halfTipAngleRad);
        const rightY = tipY - distance * Math.sin(tipRad + halfTipAngleRad);

        // 3. 构造 SVG 路径
        const path = `M ${leftX},${leftY} L ${tipX},${tipY} L ${rightX},${rightY} Z`;

        return path;
    }

    connectPointsWithTrim(points: ElbowPoint[], arrowSize: number, isClipStart = false, isClipEnd = false) {
        // 获取点的数量
        const len = points.length;
        const newPoints = [...points];
        if (isClipStart) {
            // 裁剪起点
            const startX = points[0][0];
            const startY = points[0][1];
            const nextX = points[1][0];
            const nextY = points[1][1];
            // 计算起点裁剪方向（从起点到第二个点的方向）
            const startDeltaX = nextX - startX;
            const startDeltaY = nextY - startY;
            const startDistance = Math.sqrt(startDeltaX * startDeltaX + startDeltaY * startDeltaY);
            newPoints[0] =  [startX + startDeltaX * (arrowSize / startDistance), startY + startDeltaY * (arrowSize / startDistance)]
        }
        if (isClipEnd) {
            // 裁剪终点
            const endX = points[len - 1][0];
            const endY = points[len - 1][1];
            const prevX = points[len - 2][0];
            const prevY = points[len - 2][1];
    
            // 计算终点裁剪方向（从倒数第二个点到终点的方向）
            const endDeltaX = endX - prevX;
            const endDeltaY = endY - prevY;
            const endDistance = Math.sqrt(endDeltaX * endDeltaX + endDeltaY * endDeltaY);
            newPoints[len - 1] = [endX - endDeltaX * (arrowSize / endDistance), endY - endDeltaY * (arrowSize / endDistance)]
        }
        
        return newPoints;
    }

    connectPoints(points: ElbowPoint[]) {
        // 生成 SVG 路径数据
    let pathData = `M ${points[0][0]},${points[0][1]}`; // 移动到第一个点

    for (let i = 1; i < points.length; i++) {
        pathData += ` L ${points[i][0]},${points[i][1]}`; // 连接后续点
    }
    return pathData
  }

}

