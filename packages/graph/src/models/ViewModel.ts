import { Bounds, IPoint } from "@hfdraw/types"
import { Point } from "../util/Point"

/**
 * 整体的视图的模型
 *
 */
export class ViewModel {

    viewDom:HTMLDivElement|undefined
    bounds= new Bounds(0, 0, 1000, 1000)
    minWidth=1000

    minHeight=1000
  
    background = 'white'
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

    const x = (point.x - rect.left + diagramViewDom.scrollLeft) ;
    const y = (point.y - rect.top + diagramViewDom.scrollTop);
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