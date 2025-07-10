import { Shape, EdgeShape, EventType, Bounds, StyleObject, IPoint, ShapeKey } from "@hfdraw/types";
import { ViewModel } from "./ViewModel";
import { MoveModel } from "./MoveModel";
import { SelectionModel } from "./SelectionModel";
import { IGraphOption } from "../types";
import { shallowReactive, reactive } from "vue";
import { HoverModel } from "./HoverModel";
import { EdgeMoveModel } from "./EdgeMoveModel";
import { MindMapModel } from './MindMapModel';
import { LabelEditorModel } from "./LabelEditorModel";
import { ResizeModel } from "./ResizeModel";
import { Emitter } from "../util/Emitter";
import { MarkerModel } from "./Marker/MarkerModel";

export class GraphModel {
  /**
   * 每个画布单独实例化一个 emitter 事件发射器
   */
  emitter = new Emitter()
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
  viewModel = reactive(new ViewModel());

  /**
   * 元素移动模型
   */
  moveModel = reactive<any>(new MoveModel(this));
  /**
   * 选中元素模型
   */
  selectionModel: SelectionModel = reactive(new SelectionModel(this));

  /**
  * 线移动模型(线的线段移动)
  */
  edgeMoveModel: EdgeMoveModel = reactive(new EdgeMoveModel(this))
  /**
   * 选入元素显示箭头
   */
  hoverModel: HoverModel = reactive(new HoverModel(this))
  /**
   * 脑图模型
   */
  mindMapModel: MindMapModel = reactive(new MindMapModel(this))
  /**
   * 标签编辑器模型
   */
  labelEditorModel: LabelEditorModel = reactive(new LabelEditorModel(this))
  /**
   * 图形缩放模型
   */
  resizeModel: ResizeModel = reactive(new ResizeModel(this))

    /**
   * 图形标记（高亮效果）
   */
    markerModel:MarkerModel = reactive(new MarkerModel(this))
    

  /**
   * 图形样式
   */
  /**
   * 
   */
  edges: EdgeShape[] = [];

  symbols: Shape[] = [];

  /** 下面方法会调用 graphView 传入的 props 方法，用于和 client 通信 */
  graphOption!: IGraphOption

  constructor(opt: IGraphOption) {
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
    this.emitter.on(EventType.SHAPE_MOUSE_DOWN, this.moveModel.startMove.bind(this.moveModel));
    // 数据来源于 createEventHandler 绑定的图形操作
    this.emitter.on(EventType.SHAPE_CLICK, this.shapeClick.bind(this));
    // this.emitter.on(EventType.SHAPE_MOUSE_OVER, this.hoverModel.onShapeHover.bind(this.hoverModel))
    // this.emitter.on(EventType.SHAPE_MOUSE_LEAVE, this.hoverModel.clearHoverShape.bind(this.hoverModel))
    this.emitter.on(EventType.SHAPE_CLEAR, this.clear.bind(this))
    this.emitter.on(EventType.SHAPE_MOUSE_DOWN, this.edgeMoveModel.onEdgeMousedown.bind(this.edgeMoveModel));
    // this.emitter.on(EventType.EDGE_POINT_MOUSE_DOWN, this.edgeMoveModel.onEdgeStartOrEndPointMousedown.bind(this.edgeMoveModel));
    // this.emitter.on(EventType.SHAPE_DBL_CLICK, this.labelEditorModel.onShapeNameLabelClick.bind(this.labelEditorModel));
    // emitter.on(EventType.SHAPE_MOUSE_DOWN, this.multipleSelectModel.startSelect.bind(this.multipleSelectModel));
    // emitter.on(EventType.SHAPE_MOUSE_DOWN, this.edgeMoveModel.onEdgeMousedown.bind(this.edgeMoveModel));

    // emitter.on(EventType.SHAPE_MOUSE_MOVE, this.mouseStateModel.onMouseMove.bind(this.mouseStateModel));

    this.emitter.on(EventType.SHAPE_MOUSE_UP, this.onMouseUp.bind(this));
  }
  shapeClick(event: any, shape: Shape) {
    this.selectionModel.onShapeClick(event, shape);
    this.hoverModel.clearHoverShape();
    if (shape.shapeKey === ShapeKey.MindMapShape) {
      this.mindMapModel.setSelectShape(shape) ;
    } 
  }
  onMouseUp() {
    /**
     * 不要使用定时器清楚状态。会造成快速上移动的时候，被上一个定时器清除掉状态引发bug
     */
    // if (this.moveModel.isMoving) {
    //   setTimeout(() => {
    //     this.moveModel.clear();
    //   },500);
    // }
  }
  addShape(shape: Shape) {
    if (this.shapeMap.has(shape.id)) {
      return;
    }
    this.shapeMap.set(shape.id, shallowReactive(shape));
  }
  // 图形更新的时候需要更新shapeMap，否则导致使用的地方，例如预览线生成的地方展示错误
  updateShape(shape: Shape) {
    if (!this.shapeMap.has(shape.id)) {
      return;
    }
    this.shapeMap.set(shape.id, shallowReactive(shape));
  }
  getShape(id: string): Shape | undefined {
    return this.shapeMap.get(id);
  }

  clear() {
    this.selectionModel.clearSelection();
    this.hoverModel.clearHoverShape();
    this.mindMapModel.clearSelectShape(); 
  }
}
