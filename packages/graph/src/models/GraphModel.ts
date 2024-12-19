import { EdgeShape, Shape } from "@hfdraw/types";
import { ViewModel } from "./ViewModel";
import { MoveModel } from "./MoveModel";
import { SelectionModel } from "./SelectionModel";
import { IGraphOption } from "../types";

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

  /**
   * 元素移动模型
   */
  moveModel = new MoveModel(this);
  /**
   * 选中元素模型
   */
  selectionModel = new SelectionModel(this);
  edges: EdgeShape[] = [];

  symbols: Shape[] = [];
  
  /** 下面方法会调用 graphView 传入的 props 方法，用于和 client 通信 */
  graphOption!: IGraphOption

  constructor(opt:IGraphOption) {
    this.graphOption = opt;
    this.graphOption.graph = this;
  }
}
