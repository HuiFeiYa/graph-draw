import { AdjustOptions, Direction, ElbowLineRouteOptions, ElbowPoint, RouteAdjustOptions } from "./common-type";
import { removeDuplicatePoints, simplifyOrthogonalPoints } from "./line-path";
import { RectangleClient } from "./rectangle-client";
import { PointGraph } from '../algorithms/data-structures/graph'
import { AStar } from '../algorithms/a-star'
import { PointUtil } from "./point";
/**
 * @param sourceRectangle 源形状的最小包围矩形。
 * @param targetRectangle 目标形状的最小包围矩形。
 * @returns 
 */
export const getSourceAndTargetOuterRectangle = (sourceRectangle: RectangleClient, targetRectangle: RectangleClient) => {
    const { sourceOffset, targetOffset } = reduceRouteMargin(sourceRectangle, targetRectangle);
    // 根据计算出的偏移量扩展源形状的最小包围矩形，生成外接矩形
    const sourceOuterRectangle = RectangleClient.expand(
        sourceRectangle,
        sourceOffset[3],
        sourceOffset[0],
        sourceOffset[1],
        sourceOffset[2]
    );
    // 根据计算出的偏移量扩展源形状的最小包围矩形，生成外接矩形
    const targetOuterRectangle = RectangleClient.expand(
        targetRectangle,
        targetOffset[3],
        targetOffset[0],
        targetOffset[1],
        targetOffset[2]
    );
    // 返回生成的外接矩形
    return {
        sourceOuterRectangle,
        targetOuterRectangle
    };
};
export const DEFAULT_ROUTE_MARGIN = 30;

/**
 * 计算源形状和目标形状之间的最小间距，并根据这些间距调整偏移量（offset），以便生成适当的外接矩形。
 * @param sourceRectangle 源形状的最小包围矩形。
 * @param targetRectangle 目标形状的最小包围矩形。
 * @returns 
 */
export const reduceRouteMargin = (sourceRectangle: RectangleClient, targetRectangle: RectangleClient) => {
    // 默认的偏移量（间距）
    const defaultOffset = DEFAULT_ROUTE_MARGIN;

    // 初始化源形状和目标形状的偏移量数组，默认值为默认偏移量
    let sourceOffset: number[] = new Array(4).fill(defaultOffset);
    let targetOffset: number[] = new Array(4).fill(defaultOffset);

    // 计算源形状左边到目标形状右边的距离
    const leftToRight = sourceRectangle.x - (targetRectangle.x + targetRectangle.width);
    
    // 计算目标形状左边到源形状右边的距离
    const rightToLeft = targetRectangle.x - (sourceRectangle.x + sourceRectangle.width);

    // 如果源形状左边到目标形状右边的距离小于两倍的默认偏移量且大于0，则调整两边的偏移量
    if (leftToRight > 0 && leftToRight < defaultOffset * 2) {
        const offset = leftToRight / 2;
        sourceOffset[3] = offset; // 调整源形状左边的偏移量
        targetOffset[1] = offset; // 调整目标形状右边的偏移量
    }

    // 如果目标形状左边到源形状右边的距离小于两倍的默认偏移量且大于0，则调整两边的偏移量
    if (rightToLeft > 0 && rightToLeft < defaultOffset * 2) {
        const offset = rightToLeft / 2;
        targetOffset[3] = offset; // 调整目标形状左边的偏移量
        sourceOffset[1] = offset; // 调整源形状右边的偏移量
    }

    // 计算源形状顶部到目标形状底部的距离
    const topToBottom = sourceRectangle.y - (targetRectangle.y + targetRectangle.height);
    
    // 计算目标形状顶部到源形状底部的距离
    const bottomToTop = targetRectangle.y - (sourceRectangle.y + sourceRectangle.height);

    // 如果源形状顶部到目标形状底部的距离小于两倍的默认偏移量且大于0，则调整两边的偏移量
    if (topToBottom > 0 && topToBottom < defaultOffset * 2) {
        const offset = topToBottom / 2;
        sourceOffset[0] = offset; // 调整源形状顶部的偏移量
        targetOffset[2] = offset; // 调整目标形状底部的偏移量
    }

    // 如果目标形状顶部到源形状底部的距离小于两倍的默认偏移量且大于0，则调整两边的偏移量
    if (bottomToTop > 0 && bottomToTop < defaultOffset * 2) {
        const offset = bottomToTop / 2;
        sourceOffset[2] = offset; // 调整源形状底部的偏移量
        targetOffset[0] = offset; // 调整目标形状顶部的偏移量
    }

    // 返回调整后的偏移量
    return { sourceOffset, targetOffset };
};

/**
 * 
 * @param point 句柄点
 * @param outerRectangle  外接矩形
 * @param direction 句柄的方向,下一个点朝那边画
 * 句柄的方向（direction）指的是从句柄点出发时，下一个拐点相对于句柄点的方向
 * @returns 
 */
export const getNextPoint = (point: ElbowPoint, outerRectangle: RectangleClient, direction: Direction): ElbowPoint => {
    switch (direction) {
        case Direction.top: {
            // 如果方向是顶部，则新的点位于当前点的 x 坐标，y 坐标为外接矩形的顶部边界
            return [point[0], outerRectangle.y];
        }
        case Direction.bottom: {
            // 如果方向是底部，则新的点位于当前点的 x 坐标，y 坐标为外接矩形的底部边界
            return [point[0], outerRectangle.y + outerRectangle.height];
        }
        case Direction.right: {
            // 如果方向是右侧，则新的点位于外接矩形的右侧边界，y 坐标保持不变
            return [outerRectangle.x + outerRectangle.width, point[1]];
        }
        default: {
            // 默认情况（左侧），新的点位于外接矩形的左侧边界，y 坐标保持不变
            return [outerRectangle.x, point[1]];
        }
    }
};


export const getGraphPoints = (options: ElbowLineRouteOptions) => {
    const { nextSourcePoint, nextTargetPoint, sourceOuterRectangle, targetOuterRectangle } = options;
    const x: number[] = [];
    const y: number[] = [];
    let result: ElbowPoint[] = [];

    [sourceOuterRectangle, targetOuterRectangle].forEach(rectangle => {
        x.push(rectangle.x, rectangle.x + rectangle.width / 2, rectangle.x + rectangle.width);
        y.push(rectangle.y, rectangle.y + rectangle.height / 2, rectangle.y + rectangle.height);
    });
    const rectanglesX = [
        sourceOuterRectangle.x,
        sourceOuterRectangle.x + sourceOuterRectangle.width,
        targetOuterRectangle.x,
        targetOuterRectangle.x + targetOuterRectangle.width
    ].sort((a, b) => a - b);
    x.push((rectanglesX[1] + rectanglesX[2]) / 2, nextSourcePoint[0], nextTargetPoint[0]);
    const rectanglesY = [
        sourceOuterRectangle.y,
        sourceOuterRectangle.y + sourceOuterRectangle.height,
        targetOuterRectangle.y,
        targetOuterRectangle.y + targetOuterRectangle.height
    ].sort((a, b) => a - b);
    y.push((rectanglesY[1] + rectanglesY[2]) / 2, nextSourcePoint[1], nextTargetPoint[1]);
    for (let i = 0; i < x.length; i++) {
        for (let j = 0; j < y.length; j++) {
            const point: ElbowPoint = [x[i], y[j]];
            const isInSource = RectangleClient.isPointInRectangle(sourceOuterRectangle, point);
            const isInTarget = RectangleClient.isPointInRectangle(targetOuterRectangle, point);
            if (!isInSource && !isInTarget) {
                result.push(point);
            }
        }
    }
    result = removeDuplicatePoints(result).filter(point => {
        const isInSource = RectangleClient.isPointInRectangle(sourceOuterRectangle, point);
        const isInTarget = RectangleClient.isPointInRectangle(targetOuterRectangle, point);
        return !isInSource && !isInTarget;
    });
    return result;
};


export const createGraph = (points: ElbowPoint[]) => {
    const graph = new PointGraph();
    const Xs: number[] = [];
    const Ys: number[] = [];
    points.forEach(p => {
        const x = p[0],
            y = p[1];
        if (Xs.indexOf(x) < 0) Xs.push(x);
        if (Ys.indexOf(y) < 0) Ys.push(y);
        graph.add(p);
    });
    Xs.sort((a, b) => a - b);
    Ys.sort((a, b) => a - b);
    const inHotIndex = (p: ElbowPoint): boolean => graph.has(p);
    for (let i = 0; i < Xs.length; i++) {
        for (let j = 0; j < Ys.length; j++) {
            const point: ElbowPoint = [Xs[i], Ys[j]];
            if (!inHotIndex(point)) continue;
            if (i > 0) {
                const otherPoint: ElbowPoint = [Xs[i - 1], Ys[j]];
                if (inHotIndex(otherPoint)) {
                    graph.connect(otherPoint, point);
                    graph.connect(point, otherPoint);
                }
            }
            if (j > 0) {
                const otherPoint: ElbowPoint = [Xs[i], Ys[j - 1]];
                if (inHotIndex(otherPoint)) {
                    graph.connect(otherPoint, point);
                    graph.connect(point, otherPoint);
                }
            }
        }
    }
    return graph;
};

const getAdjustOptions = (path: ElbowPoint[], centerOfAxis: number, isHorizontal: boolean) => {
    const parallelPaths: [ElbowPoint, ElbowPoint][] = [];
    let start: null | ElbowPoint = null;
    let pointOfHit: null | ElbowPoint = null;
    const axis = isHorizontal ? 0 : 1;

    for (let index = 0; index < path.length; index++) {
        const previous = path[index - 1];
        const current = path[index];
        if (start === null && previous && previous[axis] === current[axis]) {
            start = previous;
        }
        if (start !== null) {
            if (previous[axis] !== current[axis]) {
                parallelPaths.push([start, previous]);
                start = null;
            }
        }
        if (current[axis] === centerOfAxis) {
            pointOfHit = current;
        }
    }
    if (start) {
        parallelPaths.push([start, path[path.length - 1]]);
    }
    return { pointOfHit, parallelPaths };
};

const adjust = (route: ElbowPoint[], options: AdjustOptions): null | ElbowPoint[] => {
    const { parallelPaths, pointOfHit, sourceRectangle, targetRectangle } = options;
    let result = null;
    parallelPaths.forEach(parallelPath => {
        // Construct a rectangle
        const tempRectPoints = [pointOfHit, parallelPath[0], parallelPath[1]];
        // directly use getCornerPoints will bring the precision issue (eg: 263.6923375175286 - 57.130859375)
        const tempRect = RectangleClient.getRectangleByPoints(tempRectPoints);
        if (!RectangleClient.isHit(tempRect, sourceRectangle) && !RectangleClient.isHit(tempRect, targetRectangle)) {
            const tempCorners = RectangleClient.getCornerPointsByPoints(tempRectPoints);
            const indexRangeInPath: number[] = [];
            const indexRangeInCorner: number[] = [];
            route.forEach((point, index) => {
                const cornerResult = tempCorners.findIndex(corner => PointUtil.isEquals(point, corner));
                if (cornerResult !== -1) {
                    indexRangeInPath.push(index);
                    indexRangeInCorner.push(cornerResult);
                }
            });
            const newPath = [...route];
            const missCorner = tempCorners.find((c, index) => !indexRangeInCorner.includes(index)) as ElbowPoint;
            const removeLength = Math.abs(indexRangeInPath[0] - indexRangeInPath[indexRangeInPath.length - 1]) + 1;
            newPath.splice(indexRangeInPath[0] + 1, removeLength - 2, missCorner);
            const turnCount = simplifyOrthogonalPoints([...route]).length - 1;
            const simplifyPoints = simplifyOrthogonalPoints([...newPath]);
            // if (board) {
            //     debugGenerator.drawLine(board, simplifyPoints);
            // }
            const newTurnCount = simplifyPoints.length - 1;
            if (newTurnCount <= turnCount) {
                result = newPath;
            }
        }
        return null;
    });
    return result;
};

export const routeAdjust = (path: ElbowPoint[], options: RouteAdjustOptions) => {
    const { sourceRectangle, targetRectangle, centerX, centerY } = options;

    if (centerX !== undefined) {
        const optionsX = getAdjustOptions(path, centerX, true);
        const resultX =
            optionsX.pointOfHit &&
            adjust(path, { parallelPaths: optionsX.parallelPaths, pointOfHit: optionsX.pointOfHit, sourceRectangle, targetRectangle });
        if (resultX) {
            path = resultX;
        }
    }
    if (centerY !== undefined) {
        const optionsY = getAdjustOptions(path, centerY, false);
        const resultY =
            optionsY.pointOfHit &&
            adjust(path, { parallelPaths: optionsY.parallelPaths, pointOfHit: optionsY.pointOfHit, sourceRectangle, targetRectangle });
        if (resultY) {
            path = resultY;
        }
    }
    return path;
};

/**
 * 用于生成肘形线的路径，确保路径从源形状的句柄点开始，经过一系列拐点，最终到达目标形状的句柄点。
 * @param options 
 * @returns 
 */
export const generateElbowLineRoute = (options: ElbowLineRouteOptions) => {
    // 获取源形状和目标形状的第一个拐点
    const { nextSourcePoint, nextTargetPoint } = options;

    // 根据给定的选项生成图中的所有点
    const points = getGraphPoints(options);

    // 创建图结构
    const graph = createGraph(points);

    // 使用A*算法实例化路径搜索器
    const aStar = new AStar(graph);

    // 使用A*算法搜索从nextSourcePoint到nextTargetPoint的路径，考虑sourcePoint作为起点
    aStar.search(nextSourcePoint, nextTargetPoint, options.sourcePoint);

    // 获取A*算法找到的路径
    let route = aStar.getRoute(nextSourcePoint, nextTargetPoint);

    // 将sourcePoint和targetPoint添加到路径的起始和结束位置
    route = [options.sourcePoint, ...route, nextTargetPoint, options.targetPoint];

    // 中心线校正：基于水平中心线/垂直中心线修正最短路径
    // 1. 查找水平中心线（centerX）/垂直中心线（centerY）
    // 2. 在路径中查找与centerX/centerY相交的点，并找到路径中平行于centerX/centerY的线段
    // 3. 根据上一步找到的交点和平行线构建矩形
    // 4. 判断该矩形是否与任何元素相交。如果不相交，则可以根据上一步构建的矩形映射中心线
    // 5. 判断映射后的中心线路径是否满足约束条件（不能增加拐点）

    // 检查两个外接矩形在水平方向上是否有重叠
    const isHitX = RectangleClient.isHitX(options.sourceOuterRectangle, options.targetOuterRectangle);
    
    // 检查两个外接矩形在垂直方向上是否有重叠
    const isHitY = RectangleClient.isHitY(options.sourceOuterRectangle, options.targetOuterRectangle);

    // 如果没有水平重叠，则计算水平中心线
    const centerX = isHitX ? undefined : RectangleClient.getGapCenter(options.sourceOuterRectangle, options.targetOuterRectangle, true);

    // 如果没有垂直重叠，则计算垂直中心线
    const centerY = isHitY ? undefined : RectangleClient.getGapCenter(options.sourceOuterRectangle, options.targetOuterRectangle, false);

    // 对路径进行调整，考虑中心线和形状边界
    route = routeAdjust(route, { centerX, centerY, sourceRectangle: options.sourceRectangle, targetRectangle: options.targetRectangle });

    return route;
};