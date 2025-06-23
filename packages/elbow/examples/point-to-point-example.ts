/**
 * 点到点路径生成示例
 * 演示如何使用 generatePointToPointRoute 函数生成路径，并与 WaypointUtil 集成
 */

import { 
    generatePointToPointRoute, 
    generateStraightLine, 
    generateSmartRoute,
    RouteType,
    ElbowPoint,
    IPoint 
} from '../index';

// 示例1: 生成直线路径
function exampleStraightLine() {
    const startPoint: IPoint = { x: 100, y: 100 };
    const endPoint: IPoint = { x: 300, y: 200 };
    
    // 方法1: 使用主函数
    const straightPath1 = generatePointToPointRoute(startPoint, endPoint, {
        routeType: RouteType.STRAIGHT
    });
    
    // 方法2: 使用简化函数
    const straightPath2 = generateStraightLine(startPoint, endPoint);
    
    console.log('直线路径1:', straightPath1); // [[100, 100], [300, 200]]
    console.log('直线路径2:', straightPath2); // [[100, 100], [300, 200]]
    
    return straightPath1;
}

// 示例2: 生成智能折线路径
function exampleElbowLine() {
    const startPoint: ElbowPoint = [50, 50];
    const endPoint: ElbowPoint = [250, 150];
    
    // 方法1: 使用主函数
    const elbowPath1 = generatePointToPointRoute(startPoint, endPoint, {
        routeType: RouteType.ELBOW,
        margin: 40,
        fakeRectSize: 12
    });
    
    // 方法2: 使用简化函数
    const elbowPath2 = generateSmartRoute(startPoint, endPoint, 40);
    
    console.log('折线路径1:', elbowPath1);
    console.log('折线路径2:', elbowPath2);
    
    return elbowPath1;
}

// 示例3: 与 WaypointUtil 集成使用
function exampleWithWaypointUtil() {
    // 注意: 这里模拟 WaypointUtil 的 getPointsPath 方法
    // 实际使用时需要从 @hfdraw/graph 包导入
    function getPointsPath(waypoints: ElbowPoint[]): string {
        if (waypoints.length === 0) return '';
        
        let path = `M ${waypoints[0][0]} ${waypoints[0][1]}`;
        for (let i = 1; i < waypoints.length; i++) {
            path += ` L ${waypoints[i][0]} ${waypoints[i][1]}`;
        }
        return path;
    }
    
    const startPoint: IPoint = { x: 0, y: 0 };
    const endPoint: IPoint = { x: 200, y: 100 };
    
    // 生成路径点
    const pathPoints = generateSmartRoute(startPoint, endPoint);
    
    // 转换为SVG路径
    const svgPath = getPointsPath(pathPoints);
    
    console.log('路径点:', pathPoints);
    console.log('SVG路径:', svgPath);
    
    return { pathPoints, svgPath };
}

// 示例4: 处理不同的点格式
function exampleDifferentPointFormats() {
    // IPoint 格式
    const start1: IPoint = { x: 10, y: 20 };
    const end1: IPoint = { x: 100, y: 80 };
    
    // ElbowPoint 格式 (数组)
    const start2: ElbowPoint = [10, 20];
    const end2: ElbowPoint = [100, 80];
    
    // 两种格式都支持
    const path1 = generateStraightLine(start1, end1);
    const path2 = generateStraightLine(start2, end2);
    
    console.log('IPoint格式结果:', path1);
    console.log('Point格式结果:', path2);
    
    // 结果应该相同
    console.log('结果是否相同:', JSON.stringify(path1) === JSON.stringify(path2));
}

// 示例5: 错误处理和回退机制
function exampleErrorHandling() {
    const startPoint: ElbowPoint = [0, 0];
    const endPoint: ElbowPoint = [1000000, 1000000]; // 极端情况
    
    try {
        // 尝试生成折线路径，如果失败会自动回退到直线
        const path = generateSmartRoute(startPoint, endPoint);
        console.log('生成的路径:', path);
        return path;
    } catch (error) {
        console.error('路径生成失败:', error);
        // 手动回退到直线
        return generateStraightLine(startPoint, endPoint);
    }
}

// 运行所有示例
export function runAllExamples() {
    console.log('=== 点到点路径生成示例 ===\n');
    
    console.log('1. 直线路径示例:');
    exampleStraightLine();
    console.log('');
    
    console.log('2. 折线路径示例:');
    exampleElbowLine();
    console.log('');
    
    console.log('3. 与WaypointUtil集成示例:');
    exampleWithWaypointUtil();
    console.log('');
    
    console.log('4. 不同点格式示例:');
    exampleDifferentPointFormats();
    console.log('');
    
    console.log('5. 错误处理示例:');
    exampleErrorHandling();
    console.log('');
}

// 如果直接运行此文件
if (require.main === module) {
    runAllExamples();
}