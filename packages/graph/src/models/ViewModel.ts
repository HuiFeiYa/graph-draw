import {  Bounds, IPoint } from "@hfdraw/types"
import { Point } from "../util/Point"

/**
 * 整体的视图的模型
 *
 */
export class ViewModel {

    viewDom:HTMLDivElement|undefined
    bounds= new Bounds(0, 0, 1100, 900)
    
    // 画布大小配置，最小500px
    canvasWidth = 1100
    canvasHeight = 900
    minCanvasSize = 500
    
    // 默认滚动设置
    enableScroll = true
    scrollX = 0
    scrollY = 0

    background = 'white'

    setViewDom(dom:HTMLDivElement) {
      this.viewDom = dom;
    }

    /**
     * 设置画布大小
     * @param width 宽度，最小500px
     * @param height 高度，最小500px
     */
    setCanvasSize(width: number, height: number) {
      this.canvasWidth = Math.max(width, this.minCanvasSize);
      this.canvasHeight = Math.max(height, this.minCanvasSize);
      this.bounds = new Bounds(0, 0, this.canvasWidth, this.canvasHeight);
    }

    /**
     * 获取画布大小
     */
    getCanvasSize() {
      return {
        width: this.canvasWidth,
        height: this.canvasHeight
      };
    }

    /**
     * 设置滚动位置
     */
    setScrollPosition(x: number, y: number) {
      this.scrollX = x;
      this.scrollY = y;
      if (this.viewDom) {
        this.viewDom.scrollLeft = x;
        this.viewDom.scrollTop = y;
      }
    }

    /**
     * 获取当前滚动位置
     */
    getScrollPosition() {
      if (this.viewDom) {
        return {
          x: this.viewDom.scrollLeft,
          y: this.viewDom.scrollTop
        };
      }
      return {
        x: this.scrollX,
        y: this.scrollY
      };
    }

    /**
 * 转换屏幕坐标为图形的绝对坐标
 * @param point
 * @param diagramViewDom
 * @returns
 */
  translateClientPointToDiagramAbsPoint (point: Point, diagramViewDom = this.viewDom): Point {
    if (!diagramViewDom) {
      throw new Error("no view dom");

    }
    const rect = diagramViewDom.getBoundingClientRect();

    const x = (point.x - rect.left + diagramViewDom.scrollLeft) - 12;
    const y = (point.y - rect.top + diagramViewDom.scrollTop) - 12 ;
    return new Point(x, y).toInt();
  }
  /**
 * 转换图形的绝对坐标为屏幕坐标
 * @param point
 * @param diagramViewDom
 * @returns
 */
  translateDiagramAbsPointToClientPoint (point: IPoint, diagramViewDom = this.viewDom): Point {
    if (!diagramViewDom) {
      throw new Error("no view dom");

    }
    const rect = diagramViewDom.getBoundingClientRect();
    const x = point.x   - diagramViewDom.scrollLeft + rect.left;
    const y = point.y  - diagramViewDom.scrollTop + rect.top;
    return new Point(x, y).toInt();
  }

}