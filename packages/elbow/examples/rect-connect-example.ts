import { RectConnectPoint } from '../util/common-type';
import { Bounds } from '@hfdraw/types';
import { 
    generateRectConnectRoute, 
    generateSmartRectRoute, 
    generateStraightRectLine 
} from '../util/rect-connect-route';

/**
 * 示例：使用 RectConnectPoint 生成预览线路径
 */
function exampleRectConnectRoute() {
    // 定义源矩形连接点
    const sourceRect: RectConnectPoint = {
        bounds: new Bounds(50, 50, 100, 60, 50, 50), // x, y, width, height, absX, absY
        connection: [1, 0.5] // 右边中点连接
    };
    
    // 定义目标矩形连接点
    const targetRect: RectConnectPoint = {
        bounds: new Bounds(250, 150, 120, 80, 250, 150),
        connection: [0, 0.5] // 左边中点连接
    };
    
    // 方法1: 使用主函数生成折线路径
    const elbowPath = generateRectConnectRoute(sourceRect, targetRect, {
        routeType: 'elbow',
        margin: 40
    });
    
    // 方法2: 使用简化函数生成智能折线路径
    const smartPath = generateSmartRectRoute(sourceRect, targetRect, 40);
    
    // 方法3: 生成直线路径
    const straightPath = generateStraightRectLine(sourceRect, targetRect);
    
    console.log('折线路径:', elbowPath);
    console.log('智能路径:', smartPath);
    console.log('直线路径:', straightPath);
    
    return elbowPath;
}

/**
 * 示例：处理中心点连接
 */
function exampleCenterConnection() {
    const sourceRect: RectConnectPoint = {
        bounds: new Bounds(100, 100, 15, 15, 100, 100), // 小矩形
        connection: [0.5, 0.5] // 中心点连接
    };
    
    const targetRect: RectConnectPoint = {
        bounds: new Bounds(300, 200, 18, 18, 300, 200), // 小矩形
        connection: [0.5, 0.5] // 中心点连接
    };
    
    const path = generateSmartRectRoute(sourceRect, targetRect);
    console.log('中心点连接路径:', path);
    
    return path;
}

/**
 * 示例：不同连接点位置
 */
function exampleDifferentConnections() {
    const sourceRect: RectConnectPoint = {
        bounds: new Bounds(50, 50, 100, 80, 50, 50),
        connection: [0.5, 1] // 底边中点
    };
    
    const targetRect: RectConnectPoint = {
        bounds: new Bounds(200, 200, 100, 80, 200, 200),
        connection: [0.5, 0] // 顶边中点
    };
    
    const path = generateRectConnectRoute(sourceRect, targetRect, {
        routeType: 'elbow',
        margin: 30
    });
    
    console.log('不同连接点路径:', path);
    return path;
}

/**
 * 将 Bounds 数组转换为 SVG 路径字符串（用于渲染）
 */
function boundsArrayToSVGPath(bounds: Bounds[]): string {
    if (bounds.length === 0) return '';
    
    let path = `M ${bounds[0].absX} ${bounds[0].absY}`;
    for (let i = 1; i < bounds.length; i++) {
        path += ` L ${bounds[i].absX} ${bounds[i].absY}`;
    }
    return path;
}

// 导出示例函数
export {
    exampleRectConnectRoute,
    exampleCenterConnection,
    exampleDifferentConnections,
    boundsArrayToSVGPath
};

// 运行示例
if (typeof window === 'undefined') {
    // Node.js 环境下运行示例
    console.log('=== RectConnect Route Examples ===');
    exampleRectConnectRoute();
    exampleCenterConnection();
    exampleDifferentConnections();
}