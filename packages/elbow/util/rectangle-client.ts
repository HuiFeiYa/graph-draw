import { Point } from "./common-type";

/**
 * RectangleClient 接口定义了一个矩形对象的基本属性。
 */
export interface RectangleClient {
    x: number; // 矩形左上角的X坐标
    y: number; // 矩形左上角的Y坐标
    width: number; // 矩形的宽度
    height: number; // 矩形的高度
}

/**
 * PointOfRectangle 类型表示矩形内部的一个点的位置，其中x,y值在0到1之间，
 * 分别表示该点相对于矩形宽度和高度的比例位置。
 */
export type PointOfRectangle = [number, number];

/**
 * RectangleClient 对象包含多个静态方法，用于处理与矩形相关的计算和判断。
 */
export const RectangleClient = {

    /**
     * 判断两个矩形是否重叠（在X轴和Y轴方向都存在交集）。
     */
    isHit: (origin: RectangleClient, target: RectangleClient) => {
        return RectangleClient.isHitX(origin, target) && RectangleClient.isHitY(origin, target);
    },

    /**
     * 判断两个矩形是否在X轴方向上重叠。
     */
    isHitX: (origin: RectangleClient, target: RectangleClient) => {
        const minX = origin.x < target.x ? origin.x : target.x;
        const maxX = origin.x + origin.width > target.x + target.width ? origin.x + origin.width : target.x + target.width;
        // 浮点数计算误差处理
        if (Math.floor(maxX - minX - origin.width - target.width) <= 0) {
            return true;
        } else {
            return false;
        }
    },

    /**
     * 判断两个矩形是否在Y轴方向上重叠。
     */
    isHitY: (origin: RectangleClient, target: RectangleClient) => {
        const minY = origin.y < target.y ? origin.y : target.y;
        const maxY = origin.y + origin.height > target.y + target.height ? origin.y + origin.height : target.y + target.height;
        // 浮点数计算误差处理
        if (Math.floor(maxY - minY - origin.height - target.height) <= 0) {
            return true;
        } else {
            return false;
        }
    },

    /**
     * 获取一个矩形的两个对角点。
     */
    getPoints(rectangle: RectangleClient) {
        return [
            [rectangle.x, rectangle.y],
            [rectangle.x + rectangle.width, rectangle.y + rectangle.height]
        ] as [Point, Point];
    },

    /**
     * 根据中心点、宽度和高度生成一个新的矩形。
     */
    getRectangleByCenterPoint(point: Point, width: number, height: number) {
        return RectangleClient.getRectangleByPoint([point[0] - width / 2, point[1] - height / 2], width, height);
    },

    /**
     * 根据给定的起点、宽度和高度生成一个新的矩形。
     */
    getRectangleByPoint(point: Point, width: number, height: number): RectangleClient {
        return {
            x: point[0],
            y: point[1],
            width,
            height
        };
    },

    /**
     * 根据一组或多组点生成最小包围矩形。
     */
    getRectangleByPoints(points: Point[] | Point[][]): RectangleClient {
        if (isPointArray(points as any)) {
            points = [points] as any;
        }
        let xMin = Infinity;
        let yMin = Infinity;
        let xMax = -Infinity;
        let yMax = -Infinity;
        for (const point of points) {
            const xArray = point.map((ele: any) => ele[0]);
            const yArray = point.map((ele: any) => ele[1]);
            xMin = Math.min(xMin, ...xArray);
            yMin = Math.min(yMin, ...yArray);
            xMax = Math.max(xMax, ...xArray);
            yMax = Math.max(yMax, ...yArray);
        }
        const rect = { x: xMin, y: yMin, width: xMax - xMin, height: yMax - yMin };
        return rect;
    },

    /**
     * 根据一组点获取它们形成的矩形的四个顶点。
     */
    getCornerPointsByPoints(points: Point[]) {
        const xArray = points.map(ele => ele[0]);
        const yArray = points.map(ele => ele[1]);
        const xMin = Math.min(...xArray);
        const xMax = Math.max(...xArray);
        const yMin = Math.min(...yArray);
        const yMax = Math.max(...yArray);
        return [
            [xMin, yMin],
            [xMax, yMin],
            [xMax, yMax],
            [xMin, yMax]
        ] as [Point, Point, Point, Point];
    },

    /**
     * 根据给定的偏移量获取轮廓矩形。
     */
    getOutlineRectangle: (rectangle: RectangleClient, offset: number) => {
        return {
            x: rectangle.x + offset,
            y: rectangle.y + offset,
            width: rectangle.width - offset * 2,
            height: rectangle.height - offset * 2
        };
    },

    /**
     * 扩展或缩小矩形尺寸。
     */
    inflate: (rectangle: RectangleClient, delta: number) => {
        const half = delta / 2;
        return {
            x: rectangle.x - half,
            y: rectangle.y - half,
            width: rectangle.width + half * 2,
            height: rectangle.height + half * 2
        };
    },

    /**
     * 比较两个矩形是否相等。
     */
    isEqual: (rectangle: RectangleClient, otherRectangle: RectangleClient) => {
        return (
            rectangle.x === otherRectangle.x &&
            rectangle.y === otherRectangle.y &&
            rectangle.width === otherRectangle.width &&
            rectangle.height === otherRectangle.height
        );
    },

    /**
     * 获取矩形的四个顶点。
     */
    getCornerPoints: (rectangle: RectangleClient) => {
        return [
            [rectangle.x, rectangle.y],
            [rectangle.x + rectangle.width, rectangle.y],
            [rectangle.x + rectangle.width, rectangle.y + rectangle.height],
            [rectangle.x, rectangle.y + rectangle.height]
        ] as [Point, Point, Point, Point];
    },

    /**
     * 获取矩形的中心点。
     */
    getCenterPoint: (rectangle: RectangleClient) => {
        return [rectangle.x + rectangle.width / 2, rectangle.y + rectangle.height / 2] as Point;
    },

    /**
     * 根据一组点获取这些点形成的矩形的中心点。
     */
    getCenterPointByPoints: (points: Point[]) => {
        return RectangleClient.getCenterPoint(RectangleClient.getRectangleByPoints(points));
    },

    /**
     * 获取矩形各边中点。
     */
    getEdgeCenterPoints: (rectangle: RectangleClient) => {
        return [
            [rectangle.x + rectangle.width / 2, rectangle.y],
            [rectangle.x + rectangle.width, rectangle.y + rectangle.height / 2],
            [rectangle.x + rectangle.width / 2, rectangle.y + rectangle.height],
            [rectangle.x, rectangle.y + rectangle.height / 2]
        ] as [Point, Point, Point, Point];
    },

    /**
     * 获取矩形内指定比例位置的点。
     * point 表示 [xRate,yRate] 的比例，用于计算矩形上指定点的位置
     */
    getConnectionPoint: (rectangle: RectangleClient, point: PointOfRectangle) => {
        return [rectangle.x + rectangle.width * point[0], rectangle.y + rectangle.height * point[1]] as Point;
    },

    /**
     * 扩展矩形的边界。从上下左右四个方向进行拓展，对应 x、y、width、height 
     */
    expand(rectangle: RectangleClient, left: number, top: number = left, right: number = left, bottom: number = top) {
        return {
            x: rectangle.x - left,           // 将矩形的左侧向左移动 left 像素
            y: rectangle.y - top,            // 将矩形的上侧向上移动 top 像素
            width: rectangle.width + left + right,  // 增加宽度，左边增加 left，右边增加 right
            height: rectangle.height + top + bottom // 增加高度，上边增加 top，下边增加 bottom
        };
    },

    /**
     * 计算两个矩形之间的间隙中心点。
     */
    getGapCenter(rectangle1: RectangleClient, rectangle2: RectangleClient, isHorizontal: boolean) {
        const axis = isHorizontal ? 'x' : 'y';
        const side = isHorizontal ? 'width' : 'height';
        const align = [rectangle1[axis], rectangle1[axis] + rectangle1[side], rectangle2[axis], rectangle2[axis] + rectangle2[side]];
        const sortArr = align.sort((a, b) => a - b);
        return (sortArr[1] + sortArr[2]) / 2;
    },

    /**
     * 判断一个点是否位于矩形内部。
     */
    isPointInRectangle(rectangle: RectangleClient, point: Point) {
        const x = point[0],
            y = point[1];
        return x > rectangle.x && x < rectangle.x + rectangle.width && y > rectangle.y && y < rectangle.y + rectangle.height;
    },

    /**
     * 获取一组矩形的最小包围矩形。
     */
    getBoundingRectangle(rectangles: RectangleClient[]): RectangleClient {
        if (rectangles.length === 0) {
            throw new Error('rectangles can not be empty array');
        }
        let minX = Number.MAX_VALUE;
        let minY = Number.MAX_VALUE;
        let maxX = Number.NEGATIVE_INFINITY;
        let maxY = Number.NEGATIVE_INFINITY;
        rectangles.forEach(rect => {
            minX = Math.min(minX, rect.x);
            minY = Math.min(minY, rect.y);
            maxX = Math.max(maxX, rect.x + rect.width);
            maxY = Math.max(maxY, rect.y + rect.height);
        });
        return {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY
        };
    }
};

// 辅助函数，用于判断数据是否为点数组
function isPointArray(data: Point[] | Point[]): data is Point[] {
    return (
        Array.isArray(data) &&
        data.every(item => Array.isArray(item) && item.length === 2 && typeof item[0] === 'number' && typeof item[1] === 'number')
    );
}