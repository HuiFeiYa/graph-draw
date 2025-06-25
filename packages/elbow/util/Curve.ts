import { IPoint } from "@hfdraw/types";

export class Curve {
  // 可配置参数
  private readonly CONTROL_FACTOR = 0.3; // 控制点偏移系数
  private readonly START_WEIGHT = 0.33; // 控制点水平位置权重
  private readonly LINE_Y_GAP = 30; // 多线间距
  drawSecondOrderBezierForRetrospect(
    point1: IPoint,
    point2: IPoint,
    index = 0
  ) {
    const dx = point2.x - point1.x;
    const absDx = Math.abs(dx);
    const isPositive = dx > 0;
    // 动态计算 CONTROL_FACTOR
    const baseFactor = 0.1; // 基础系数
    const factorStep = 0.1; // 每 200 区间增加的系数
    const interval = 200; // 区间大小
    const controlXMove = 80;
    // 计算 CONTROL_FACTOR
    const CONTROL_FACTOR = baseFactor + Math.floor(absDx / interval) * factorStep;
    // 水平位置：始终在起点到终点的1/3处
    const diffX = isPositive ? Math.min(dx * this.START_WEIGHT, controlXMove) : Math.max(dx * this.START_WEIGHT, -controlXMove);
    const controlX = point1.x + diffX;
    console.log('dx * this.START_WEIGHT:', dx * this.START_WEIGHT);
    // 基础偏移量：水平差越大，控制点偏移越大
    const baseOffset = absDx * CONTROL_FACTOR;

    // 根据 point1.y 和 point2.y 的关系决定控制点位置
    let controlY: number;
    let labelYOffset: number;

    if (point1.y >= point2.y) {
      controlY = Math.min(point1.y, point2.y) - baseOffset;
      labelYOffset = -14; // 标签向上偏移
    } else {
      controlY = Math.max(point1.y, point2.y) + baseOffset;
      labelYOffset = 14; // 标签向下偏移
    }
    if (point1.y === point2.y) {
      controlY = this.LINE_Y_GAP * index;
    }
    return {
      linePath: `M ${point1.x},${point1.y} Q ${controlX},${controlY} ${point2.x},${point2.y}`,
      labelX: controlX - 21,
      labelY: controlY + labelYOffset
    };
  }
  /**
 * 计算箭头方向
 * @param pathData 贝塞尔曲线路径数据
 * @returns 箭头方向（角度，以度为单位）
 */
  calculateArrowDirectionPoint(pathData: string) {
  // 创建一个临时的 SVG 路径元素
    const svgNS = 'http://www.w3.org/2000/svg';
    const pathElement = document.createElementNS(svgNS, 'path');
    pathElement.setAttribute('d', pathData);

    // 将路径元素添加到 DOM 中（临时）
    document.body.appendChild(pathElement);

    // 获取路径总长度
    const pathLength = Math.floor(pathElement.getTotalLength());
    // 动态调整距离，确保不超过路径长度的一半
    const dynamicDistance = Math.min(8, Math.floor(pathLength * 0.5));
    // 获取终点附近的两个点
    const pointBeforeEnd = pathElement.getPointAtLength(pathLength - dynamicDistance); // 终点前一个点
    const pointEnd = pathElement.getPointAtLength(pathLength);
    const dx = pointEnd.x - pointBeforeEnd.x;
    const dy = pointEnd.y - pointBeforeEnd.y;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI); // 转换为角度
    // 移除临时路径元素
    document.body.removeChild(pathElement);
    return angle;
  }
  drawThirdOrderBezierForRetrospect(point1: {x: number, y: number}, point2: {x: number, y: number}) {
     // 计算两个点之间的中心点
     const centerX = (point1.x + point2.x) / 2;
     // 调整控制点的位置，使曲线更平滑
     const control1X = centerX + (point2.x - point1.x) * 0.25; // 控制点1向右偏移
     const control1Y = point1.y;
     const control2X = centerX - (point2.x - point1.x) * 0.25; // 控制点2向左偏移
     const control2Y = point2.y;
 
     // 生成贝塞尔曲线路径
     const linePath = `M ${point1.x} ${point1.y} C ${control1X} ${control1Y}, ${control2X} ${control2Y}, ${point2.x} ${point2.y}`;
 
     return { linePath };
  }
}

export const curve = new Curve();