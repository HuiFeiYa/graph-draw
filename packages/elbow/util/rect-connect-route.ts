import { ElbowPoint, RectConnectPoint } from './common-type';
import { Bounds, IPoint, Point } from '@hfdraw/types';
import { RectangleClient } from './rectangle-client';
import { generateElbowLineRoute } from './elbow-line-route';
import { removeDuplicatePoints } from './line-path';
import { getArrowLineHandleRefPair, getElbowLineRouteOptions } from './arrow-line-common';
import { waypointUtil } from '@hfdraw/utils';

export interface RectConnectRouteOptions {
    routeType?: 'straight' | 'elbow';
    margin?: number; // 折线时的边距
}

/**
 * 根据两个 RectConnectPoint 生成预览线的路径点数组
 * @param sourceRect 源矩形连接点
 * @param targetRect 目标矩形连接点
 * @param options 配置选项
 * @returns IPoint[] 数组格式的路径点
 */
export function generateRectConnectRoute(
    sourceRect: RectConnectPoint,
    targetRect: RectConnectPoint,
    options: RectConnectRouteOptions = {}
): IPoint[] {
    const { 
        routeType = 'elbow', 
        margin = 30
    } = options;

    if (routeType === 'straight') {
        return generateStraightRectRoute(sourceRect, targetRect);
    } else {
        return generateElbowRectRoute(sourceRect, targetRect, margin);
    }
}

/**
 * 生成直线路径
 * @param sourceRect 源矩形连接点
 * @param targetRect 目标矩形连接点
 * @returns IPoint[] 数组格式的路径点
 */
function generateStraightRectRoute(
    sourceRect: RectConnectPoint,
    targetRect: RectConnectPoint
): IPoint[] {
    // 计算连接点的实际坐标
    const sourcePoint = getActualConnectionPoint(sourceRect);
    const targetPoint = getActualConnectionPoint(targetRect);
    
    // 转换为 IPoint 数组格式
    return [
        new Point(sourcePoint[0], sourcePoint[1]),
        new Point(targetPoint[0], targetPoint[1])
    ];
}

/**
 * 生成折线路径（肘形路径）
 * @param sourceRect 源矩形连接点
 * @param targetRect 目标矩形连接点
 * @param margin 边距
 * @returns IPoint[] 数组格式的路径点
 */
function generateElbowRectRoute(
    sourceRect: RectConnectPoint,
    targetRect: RectConnectPoint,
    margin: number
): IPoint[] {
    // 将 Bounds 转换为 ElbowPoint[] 格式
    const sourcePoints = boundsToElbowPoints(sourceRect.bounds);
    const targetPoints = boundsToElbowPoints(targetRect.bounds);
    
    // 创建 PlaitElement 用于路径计算
    const element = {
        source: {
            connection: sourceRect.connection
        },
        target: {
            connection: targetRect.connection
        }
    };

    try {
        // 使用现有的肘形路径算法
        const handleRefPair = getArrowLineHandleRefPair(sourcePoints, targetPoints, element);
        const params = getElbowLineRouteOptions(sourcePoints, targetPoints, element, handleRefPair);
        const route = generateElbowLineRoute(params);
        const keyPoints = removeDuplicatePoints(route);
        const points = keyPoints.map(([x,y]) =>new Point(x,y))
        // 合并连续的共线点
        const optimizedPoints = waypointUtil.mergeCollinearPoints(points);
        
        // 转换为 IPoint 数组格式
        return optimizedPoints;
    } catch (error) {
        // 如果肘形路径生成失败，回退到直线
        console.warn('Elbow route generation failed, falling back to straight line:', error);
        return generateStraightRectRoute(sourceRect, targetRect);
    }
}

/**
 * 根据 RectConnectPoint 计算实际的连接点坐标
 * @param rectConnect 矩形连接点
 * @returns 实际连接点坐标
 */
function getActualConnectionPoint(rectConnect: RectConnectPoint): ElbowPoint {
    const { bounds, connection } = rectConnect;
    
    // 如果连接点是中心点 [0.5, 0.5] 或者矩形足够小，使用中心点
    if ((connection[0] === 0.5 && connection[1] === 0.5) || 
        (bounds.width <= 20 && bounds.height <= 20)) {
        return [
            bounds.absX + bounds.width / 2,
            bounds.absY + bounds.height / 2
        ];
    }
    
    // 根据连接点比例计算实际坐标
    return [
        bounds.absX + bounds.width * connection[0],
        bounds.absY + bounds.height * connection[1]
    ];
}

/**
 * 将 Bounds 转换为 ElbowPoint[] 格式（矩形的四个角点）
 * @param bounds 边界矩形
 * @returns 矩形的四个角点
 */
function boundsToElbowPoints(bounds: Bounds): ElbowPoint[] {
    return [
        [bounds.absX, bounds.absY], // 左上角
        [bounds.absX + bounds.width, bounds.absY], // 右上角
        [bounds.absX + bounds.width, bounds.absY + bounds.height], // 右下角
        [bounds.absX, bounds.absY + bounds.height] // 左下角
    ];
}



/**
 * 简化版本：生成智能折线路径
 * @param sourceRect 源矩形连接点
 * @param targetRect 目标矩形连接点
 * @param margin 可选的边距设置
 * @returns IPoint[] 数组格式的路径点
 */
export function generateSmartRectRoute(
    sourceRect: RectConnectPoint,
    targetRect: RectConnectPoint,
    margin?: number
): IPoint[] {
    return generateRectConnectRoute(sourceRect, targetRect, { 
        routeType: 'elbow', 
        margin 
    });
}

/**
 * 简化版本：只生成直线路径
 * @param sourceRect 源矩形连接点
 * @param targetRect 目标矩形连接点
 * @returns IPoint[] 数组格式的路径点
 */
export function generateStraightRectLine(
    sourceRect: RectConnectPoint,
    targetRect: RectConnectPoint
): IPoint[] {
    return generateRectConnectRoute(sourceRect, targetRect, { routeType: 'straight' });
}