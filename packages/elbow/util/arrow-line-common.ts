import { rotatePointsByElement } from "./angle";
import { ArrowLineHandleKey } from "./common-enum";
import { ArrowLineHandleRef, ArrowLineHandleRefPair, Direction, PlaitElement, Point, PointOfRectangle, Vector } from "./common-type";
import { getDirectionByPointOfRectangle, getDirectionByVector, getOppositeDirection } from "./direction";
import { getNextPoint, getSourceAndTargetOuterRectangle } from "./elbow-line-route";
import { RectangleClient } from "./rectangle-client";


export const getArrowLineHandleRefPair = (sourcePoints: Point[][], targetPoints: Point[][], element:PlaitElement) => {
    // 根据 sourcePoint 和 element 中的 connection 比例计算出连接起点的位置
    let sourcePoint = getConnectionPoint(sourcePoints, element.source.connection);
    let targetPoint = getConnectionPoint(targetPoints, element.target.connection);
    // 两个点的差值计算得到的向量
    let sourceDirection = getDirectionByVector([targetPoint[0] - sourcePoint[0], targetPoint[1] - sourcePoint[1]]) || Direction.right;
    // 返回给定方向的相反方向
    let targetDirection = getOppositeDirection(sourceDirection);
    // 获取给定的方向返回相应的坐标变化因子例如： [Direction.left]: { x: -1, y: 0 },
    const sourceFactor = getDirectionFactor(sourceDirection);
    const targetFactor = getDirectionFactor(targetDirection);

    const sourceHandleRef: ArrowLineHandleRef = {
        key: ArrowLineHandleKey.source,
        point: sourcePoint,
        direction: sourceDirection,
        vector: [sourceFactor.x, sourceFactor.y]
    };
    const targetHandleRef: ArrowLineHandleRef = {
        key: ArrowLineHandleKey.target,
        point: targetPoint,
        direction: targetDirection,
        vector: [targetFactor.x, targetFactor.y]
    };
    if (sourcePoints) {
        const sourceVector = getVectorByConnection(sourcePoints, element.source.connection!);
        sourceHandleRef.vector = sourceVector;
        const direction = getDirectionByVector(sourceVector);
        sourceDirection = direction ? direction : sourceDirection;
        sourceHandleRef.direction = sourceDirection;
        sourcePoint = getConnectionPoint(sourcePoints, element.source.connection!, sourceDirection);
    }

    if (targetPoints) {
        const targetVector = getVectorByConnection(targetPoints, element.target.connection!);
        targetHandleRef.vector = targetVector;
        const direction = getDirectionByVector(targetVector);
        targetDirection = direction ? direction : targetDirection;
        targetHandleRef.direction = targetDirection;
        targetPoint = getConnectionPoint(targetPoints, element.target.connection!, targetDirection);
    }

    return { source: sourceHandleRef, target: targetHandleRef };
}

/**
 * 返回一个对象，
 * 包含源形状和目标形状的最小包围矩形（sourceRectangle 和 targetRectangle）。
 * @param sourcePoints - 源形状的点集，每个点是一个 [x, y] 数组。
 * @param targetPoints - 目标形状的点集，每个点是一个 [x, y] 数组。
 * @param element - 包含几何信息的元素对象（未在该方法中使用）。
 * @param handleRefPair - 箭头线的句柄引用对（未在该方法中使用）。
 * @returns 包含源形状和目标形状的最小包围矩形的对象。
 */
export const getSourceAndTargetRectangle = (sourcePoints: Point[][], targetPoints: Point[][], element: PlaitElement, handleRefPair: ArrowLineHandleRefPair) => {
    let sourceRectangle = RectangleClient.getRectangleByPoints(sourcePoints);
    let targetRectangle = RectangleClient.getRectangleByPoints(targetPoints);
    return {
        sourceRectangle,
        targetRectangle
    };
};

/**
 * 获取肘形线（elbow line）的路由选项。
 *
 * @param sourcePoints - 源形状的点集，每个点是一个 [x, y] 数组。
 * @param targetPoints - 目标形状的点集，每个点是一个 [x, y] 数组。
 * @param element - 包含几何信息的元素对象（未在该方法中使用）。
 * @param handleRefPair -  
 * handleRefPair 参数用于描述源（source）和目标（target）之间肘形连接线的起点和终点，以及这些点的方向和向量。这个参数包含两个主要部分：source 和 target，每个部分都有以下字段：
            key: 一个字符串，表示这是源还是目标端点。
            point: 一个二维数组 [x, y]，表示该点在画布上的坐标位置。
            direction: 字符串，指示从该点出发或到达该点时的朝向（例如 "bottom", "right" 等）。
            vector: 一个二维数组 [dx, dy]，表示方向向量，用于数学计算，比如确定线条延伸的方向。
 * @returns 包含肘形线路由选项的对象，包括关键点、矩形和外接矩形。
 */
export const getElbowLineRouteOptions = (sourcePoints: Point[][], targetPoints: Point[][],element:PlaitElement,handleRefPair?: ArrowLineHandleRefPair) => {
    handleRefPair = handleRefPair ?? getArrowLineHandleRefPair(sourcePoints,targetPoints, element);
    const { sourceRectangle, targetRectangle } = getSourceAndTargetRectangle(sourcePoints,targetPoints, element, handleRefPair);
    const { sourceOuterRectangle, targetOuterRectangle } = getSourceAndTargetOuterRectangle(sourceRectangle, targetRectangle);
    const sourcePoint = handleRefPair.source.point;
    const targetPoint = handleRefPair.target.point;
    const nextSourcePoint = getNextPoint(sourcePoint, sourceOuterRectangle, handleRefPair.source.direction);
    const nextTargetPoint = getNextPoint(targetPoint, targetOuterRectangle, handleRefPair.target.direction);
    return  {
        // 源形状上的连接点坐标
        sourcePoint,                // [x, y] - 源形状上的具体连接点
    
        // 从源形状出发的第一个拐点坐标
        nextSourcePoint,        // [x, y] - 第一个拐点，通常位于源形状的外接矩形边缘上
    
        // 源形状的最小包围矩形
        sourceRectangle,        // { x: number, y: number, width: number, height: number } - 包含源形状所有点的最小矩形
    
        // 源形状的外接矩形
        sourceOuterRectangle,   // { x: number, y: number, width: number, height: number } - 可能比最小包围矩形稍大一些，确保肘形线不会过于接近源形状的边界
    
        // 目标形状上的连接点坐标
        targetPoint,                // [x, y] - 目标形状上的具体连接点
    
        // 从目标形状出发的第一个拐点坐标
        nextTargetPoint,        // [x, y] - 第一个拐点，通常位于目标形状的外接矩形边缘上
    
        // 目标形状的最小包围矩形
        targetRectangle,        // { x: number, y: number, width: number, height: number } - 包含目标形状所有点的最小矩形
    
        // 目标形状的外接矩形
        targetOuterRectangle // { x: number, y: number, width: number, height: number } - 可能比最小包围矩形稍大一些，确保肘形线不会过于接近目标形状的边界
    };
}
/**
 * 获取矩形上指定点的位置
 * @param points 矩形上的点
 * @param connection 表示 [xRate,yRate] 的比例，用于计算矩形上指定点的位置
 * @param direction  可选的方向枚举值，表示移动的方向
 * @param delta 可选的偏移量，表示沿指定方向移动的距离
 * @returns 
 */
export const getConnectionPoint = (points: Point[][], connection: Point, direction?: Direction, delta?: number): Point => {
    const rectangle = RectangleClient.getRectangleByPoints(points);
    if (direction && delta) {
        const directionFactor = getDirectionFactor(direction);
        const point = RectangleClient.getConnectionPoint(rectangle, connection);
        return [point[0] + directionFactor.x * delta, point[1] + directionFactor.y * delta];
    } else {
        return RectangleClient.getConnectionPoint(rectangle, connection);
    }
};

const handleDirectionFactors = {
    [Direction.left]: { x: -1, y: 0 },
    [Direction.right]: { x: 1, y: 0 },
    [Direction.top]: { x: 0, y: -1 },
    [Direction.bottom]: { x: 0, y: 1 }
};

export function getDirectionFactor(direction: Direction) {
    return handleDirectionFactors[direction];
}

// 根据一个形状元素和连接点的比例位置，计算并返回一个向量。这个向量通常表示从形状的某个边缘或切线方向出发的方向
export const getVectorByConnection = (points: Point[][], connection: PointOfRectangle): Vector => {
    const rectangle = RectangleClient.getRectangleByPoints(points);
    let vector: Vector = [0, 0];
    const direction = getDirectionByPointOfRectangle(connection);
    if (direction) {
        const factor = getDirectionFactor(direction);
        return [factor.x, factor.y];
    }
    return vector;
};