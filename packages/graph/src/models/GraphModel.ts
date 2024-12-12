import { EdgeShape, Shape } from "@hfdraw/types";
import { ViewModel } from "./ViewModel";

export class GraphModel {
  /**
   * 根图形
   */
  rootShape: Shape | undefined = undefined;
  /**
   * 图形id索引
   */
  shapeMap = new Map<string, Shape>();

  /**
   * 线id索引
   */
  edgeMap = new Map<string, EdgeShape>();

  /**
   * 视图模型
   */
  viewModel = new ViewModel();

  edges: EdgeShape[] = []

  symbols: Shape[] = []
}
