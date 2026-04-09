import { ElbowPoint } from './common-type';
import { RectangleClient } from './rectangle-client';
import { generateElbowLineRoute } from './elbow-line-route';
import { removeDuplicatePoints } from './line-path';
import { getArrowLineHandleRefPair, getElbowLineRouteOptions } from './arrow-line-common';
import { waypointUtil } from '@hfdraw/utils';
import { IPoint, Point } from '@hfdraw/types';

export enum RouteType {
    STRAIGHT = 'straight',
    ELBOW = 'elbow'
}

export interface PointToPointOptions {
    routeType?: RouteType;
    margin?: number; // 折线时的边距
    fakeRectSize?: number; // 生成假矩形的大小
}

/**
 * 根据起点和终点生成路径点数组
 * @param startPoint 起点坐标
 * @param endPoint 终点坐标
 * @param options 配置选项
 * @returns 路径点数组
 */
export function generatePointToPointRoute(
    startPoint: IPoint, 
    endPoint: IPoint, 
    options: PointToPointOptions = {}
): IPoint[] {
    const { 
        routeType = RouteType.STRAIGHT, 
        margin = 30, 
        fakeRectSize = 10 
    } = options;

    // 使用 IPoint 格式
    const start: IPoint = startPoint;
    const end: IPoint = endPoint;

    if (routeType === RouteType.STRAIGHT) {
        return generateStraightRoute(start, end);
    } else {
        return generateElbowRoute(start, end, margin, fakeRectSize);
    }
}

/**
 * 生成直线路径
 * @param start 起点
 * @param end 终点
 * @returns 包含起点和终点的数组
 */
function generateStraightRoute(start: IPoint, end: IPoint): IPoint[] {
    return [start, end];
}

/**
 * 生成折线路径（肘形路径）
 * @param start 起点
 * @param end 终点
 * @param margin 边距
 * @param fakeRectSize 假矩形大小
 * @returns 折线路径点数组
 */
function generateElbowRoute(start: IPoint, end: IPoint, margin: number, fakeRectSize: number): IPoint[] {
    // 在起点和终点周围创建小的假矩形，使用传入的margin参数
    const startRect = createFakeRectangleWithMargin(start, fakeRectSize, margin);
    const endRect = createFakeRectangleWithMargin(end, fakeRectSize, margin);

    // 动态计算连接点位置
    const sourceConnection = calculateConnectionPoint(start, end, true);
    const targetConnection = calculateConnectionPoint(end, start, false);

    // 创建PlaitElement用于路径计算
    const element = {
        source: {
            connection: sourceConnection
        },
        target: {
            connection: targetConnection
        }
    };

    try {
        // 使用现有的肘形路径算法
        const handleRefPair = getArrowLineHandleRefPair(startRect, endRect, element);
        const params = getElbowLineRouteOptions(startRect, endRect, element, handleRefPair);
        const route = generateElbowLineRoute(params);
        const keyPoints = removeDuplicatePoints(route);
        
        // 转换 ElbowPoint[] 为 IPoint[]
        return keyPoints.map(point => new Point(point[0], point[1]));
    } catch (error) {
        // 如果肘形路径生成失败，回退到直线
        console.warn('Elbow route generation failed, falling back to straight line:', error);
        return generateStraightRoute(start, end);
    }
}

/**
 * 在指定点周围创建一个小矩形
 * @param center 中心点
 * @param size 矩形大小
 * @returns 矩形的四个角点
 */
function createFakeRectangle(center: IPoint, size: number): ElbowPoint[] {
    const halfSize = size / 2;
    const { x, y } = center;
    
    return [
        [x - halfSize, y - halfSize], // 左上角
        [x + halfSize, y + halfSize]  // 右下角
    ];
}

/**
 * 在指定点周围创建一个带边距的矩形
 * @param center 中心点
 * @param size 矩形基础大小
 * @param margin 边距
 * @returns 矩形的四个角点
 */
function createFakeRectangleWithMargin(center: IPoint, size: number, margin: number): ElbowPoint[] {
    const halfSize = (size + margin) / 2;
    const { x, y } = center;
    
    return [
        [x - halfSize, y - halfSize], // 左上角
        [x + halfSize, y + halfSize]  // 右下角
    ];
}

/**
 * 根据两点位置动态计算连接点在矩形边上的位置
 * @param fromPoint 起始点
 * @param toPoint 目标点
 * @param isSource 是否为源连接点
 * @returns 连接点位置 [x比例, y比例]
 */
function calculateConnectionPoint(fromPoint: IPoint, toPoint: IPoint, isSource: boolean): [number, number] {
    const fromX = fromPoint.x, fromY = fromPoint.y;
    const toX = toPoint.x, toY = toPoint.y;
    
    const deltaX = toX - fromX;
    const deltaY = toY - fromY;
    
    // 根据方向确定连接点位置
    // 水平方向优先
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // 水平连接
        if (deltaX > 0) {
            // 目标在右侧，连接点在右边
            return isSource ? [1, 0.5] : [0, 0.5];
        } else {
            // 目标在左侧，连接点在左边
            return isSource ? [0, 0.5] : [1, 0.5];
        }
    } else {
        // 垂直连接
        if (deltaY > 0) {
            // 目标在下方，连接点在下边
            return isSource ? [0.5, 1] : [0.5, 0];
        } else {
            // 目标在上方，连接点在上边
            return isSource ? [0.5, 0] : [0.5, 1];
        }
    }
}

/**
 * 简化版本：只生成直线路径
 * @param startPoint 起点
 * @param endPoint 终点
 * @returns 直线路径点数组
 */
export function generateStraightLine(startPoint: IPoint, endPoint: IPoint): IPoint[] {
    return generatePointToPointRoute(startPoint, endPoint, { routeType: RouteType.STRAIGHT });
}

/**
 * 简化版本：生成智能折线路径
 * @param startPoint 起点
 * @param endPoint 终点
 * @param margin 可选的边距设置
 * @returns 折线路径点数组
 */
export function generateSmartRoute(startPoint: IPoint, endPoint: IPoint, margin?: number): IPoint[] {
    const points = generatePointToPointRoute(startPoint, endPoint, { 
        routeType: RouteType.ELBOW, 
        margin 
    });
    
    // 合并连续的共线点
    return waypointUtil.mergeCollinearPoints(points);
}