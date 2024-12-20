import { EdgeShape, EventType, Shape } from "@hfdraw/types";
import { ViewModel } from "./ViewModel";
import { MoveModel } from "./MoveModel";
import { SelectionModel } from "./SelectionModel";
import { IGraphOption } from "../types";
import { emitter } from "../util/Emitter";
import { shallowReactive } from "vue";

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
    this.init()
  }
  init() {
      this.initEvents();
  }
  initEvents() {
    // emitter.on(EventType.SHAPE_MOUSE_DOWN, this.mouseStateModel.onMouseDown.bind(this.mouseStateModel));

    // 开始监听移动事件
    emitter.on(EventType.SHAPE_MOUSE_DOWN, this.moveModel.startMove.bind(this.moveModel));
    // emitter.on(EventType.SHAPE_MOUSE_DOWN, this.multipleSelectModel.startSelect.bind(this.multipleSelectModel));
    // emitter.on(EventType.SHAPE_MOUSE_DOWN, this.edgeMoveModel.onEdgeMousedown.bind(this.edgeMoveModel));

    // emitter.on(EventType.SHAPE_MOUSE_MOVE, this.mouseStateModel.onMouseMove.bind(this.mouseStateModel));

    // emitter.on(EventType.SHAPE_MOUSE_UP, this.mouseStateModel.onMouseUp.bind(this.mouseStateModel));
  }

  addShape(shape: Shape) {
    if (this.shapeMap.has(shape.id)) {
      return;
    }
    this.shapeMap.set(shape.id, shallowReactive(shape));
  }
}
