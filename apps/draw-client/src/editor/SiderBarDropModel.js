import { GraphModel } from "../graph/models/graphModel"
import { addShapesService } from "../graph/service"
import { SiderBarDropRunner } from "../graph/shape/behavior/SiderBarDropRunner"
import { EventType, MetaclassType, SiderbarItemKey } from "../graph/shape/constant"
import { Shape } from "../graph/types"
import { Point } from "../graph/util/Point"
const StartMoveSource = {
  SiderBar : 'SiderBar', // SiderBar 拖拽移动
  Shape : 'Shape', // 图形移动
  QuickCreatePoint : 'QuickCreatePoint'
}

export class SiderBarDropModel {
  /** 是否在画布中 */
  isPointInDiagram = false

  iconPosition = new Point()
  visible = false
  siderbarItem
  dropRunner = new SiderBarDropRunner()
  clearEvents
  constructor(graph,tab) {
    this.graph = graph;
    this.tab = tab;
   }
  clear() {
    this.siderbarItem = undefined;
    this.visible = false;
    this.isPointInDiagram = false;

  }
  onMouseDown(item) {
    this.clear()
    this.siderbarItem = item;
    const onMouseMove = (evt, shape) => {

      this.onMouseMove(evt, shape);
    };
    const onMouseUp = (evt, shape) => {
      console.log('onMouseUp');
      this.visible = false;
      this.dropToShape(evt, shape)
      if (!evt.shiftKey) {
        this.clearEvents?.();
        this.clear()
      }

    }

    this.clearEvents = () => {
      console.log('clearEvents');
      this.graph.emitter.off(EventType.SHAPE_MOUSE_MOVE, onMouseMove);
      this.graph.emitter.off(EventType.SHAPE_MOUSE_UP, onMouseUp);
      this.clearEvents = undefined;
    };

    this.graph.emitter.on(EventType.SHAPE_MOUSE_MOVE, onMouseMove);
    this.graph.emitter.on(EventType.SHAPE_MOUSE_UP, onMouseUp);
  }
  // 监听 graph-view 的移动，更新 point 的位置
  async onMouseMove(event, shape) {
    requestAnimationFrame(() => {
      this.iconPosition.x = event.clientX;
      this.iconPosition.y = event.clientY;
      const rect = this.graph.viewModel.viewDom?.getBoundingClientRect();
      this.isPointInDiagram = event.clientX > rect.left && event.clientY > rect.top;

    });
  }
  async dropToShape(evt, shape) {
    const siderbarItem = this.siderbarItem
    if (!siderbarItem) return
    let point = this.graph.viewModel.translateClientPointToDiagramAbsPoint(new Point(evt.clientX, evt.clientY));
    const siderBarkey = siderbarItem.showData.siderBarkey;
    await this.dropSiderbarKeyToShape(evt, shape, point, siderBarkey);

  }
  async dropSiderbarKeyToShape(evt, shape, point, sidebarKey) {
    // 获取对应的behavior，创建对应的shape
    await this.dropRunner.run(sidebarKey, { point, parentId: this.graph.rootShape.id })
    const { createdShapes, affectedShapes } = this.dropRunner
    addShapesService(createdShapes, affectedShapes)
    // 默认选中创建的元素
    this.graph.moveModel.startMove(evt, StartMoveSource.SiderBar, createdShapes[0])
  }
}