import { GraphModel } from "@hfdraw/graph";
import { MoveModel } from "@hfdraw/graph/src/models/MoveModel";
import { IGraphOption } from "@hfdraw/graph/src/types";
import { shapeService } from "../util/ShapeService";
import { EdgeMoveType, IBounds, IPoint, Shape, StyleObject, VertexType } from "@hfdraw/types";
import { useUiStore } from "../stores/ui";
import { SideBarWidth, popoverGap, popoverList, popoverWidth } from "../constants/config";
import { PopoverListItem, PopoverListItemType } from '../types/ui'
import { Point } from "@hfdraw/graph/src/util/Point";

export class GraphOption implements IGraphOption {
  // 在构造函数中获取 store 实例
  graph!: GraphModel;
  scale: number = 1;
  
  constructor(public projectId: string) {

  }
  async customEndMove(moveModel: MoveModel, dx: number, dy: number) {
    if (dx === 0 && dy === 0) {
      return 
    }
    const movingShapes = moveModel.movingShapes;
    const shapeIds = movingShapes.map(it => it.id);
    await shapeService.moveShape({
      projectId: this.projectId, shapeIds, dx, dy
    })
  }

  async EdgePointEndMove(shapeId: string, waypoint: Point[], styleObject: StyleObject) {
    await shapeService.moveEdge({
      shapeId, waypoint, projectId: this.projectId, styleObject
    })
  }

  showPopover(index:VertexType, shape: Shape) {
    const store = useUiStore();
    const { x, y, height, width } = shape.bounds;
    const isHorizontal = [VertexType.top, VertexType.bottom].includes(index)
    let item:PopoverListItem = {
      type: isHorizontal ? PopoverListItemType.horizontal : PopoverListItemType.vertical,
      x: x + SideBarWidth,
      y: y ,
      list: popoverList,
      index,
      shape
    }
    switch(index) {
      case VertexType.left: {
        item.x = item.x - popoverGap - popoverWidth;
        break;
      }
      case VertexType.top: {
        item.x = item.x + (popoverList.length * 30 / 2 ) - 15
        item.y = item.y - 52 - popoverGap
        break
      }
      case VertexType.bottom: {
        item.x = item.x + (popoverList.length * 30 / 2 ) - 15
        item.y = item.y + height  + popoverGap + 38
        break
      }
      case VertexType.right: {
        item.x = item.x  + popoverWidth + width;
        break;
      }
    }
    store.setPopoverList([item])
  }
  async addMindMapRect(index:VertexType, shape: Shape) {
    await shapeService.createMindMapRect({shapeId: shape.id, diagramId: shape.diagramId, depth: shape.style.retrospectOption?.shapeDepth || 1, projectId: this.projectId});
  }
  async saveText(shape: Shape, text: string) {
    if (shape.modelName !== text) {
      await shapeService.saveText({shapeId: shape.id, text, projectId: this.projectId});
    }
  }
  async expandShape(shapeId: string, expand: boolean) {
    await shapeService.expandShape({shapeId, expand, projectId: this.projectId});
  }

  async onShapeResized(shape: Shape, vertexType: VertexType, newBounds: IBounds) {
    console.log('onShapeResized', shape, vertexType, newBounds);
    await shapeService.resizeShape({
      shapeId: shape.id,
      projectId: this.projectId,
      bounds: newBounds
    })
  }
  getMinimumBounds(shape: Shape, vtxIndex: VertexType) {
    return shapeService.getResizeMinimumBounds(this.projectId,  shape.id, vtxIndex);
  }

  // 缩放相关方法
  setScale(newScale: number) {
    this.scale = Math.max(0.1, Math.min(5, newScale)); // 限制缩放范围在0.1到5之间
  }

  zoomIn() {
    this.setScale(this.scale * 1.1);
  }

  zoomOut() {
    this.setScale(this.scale / 1.1);
  }

  handleWheel(event: WheelEvent) {
    event.preventDefault();
    const delta = event.deltaY < 0 ? 1.02 : 0.98;
    this.setScale(this.scale * delta);
  }
  // 变更线上的关系
  async changeRelationshipEnds(edgeShape: Shape, waypoint: IPoint[], moveType?:EdgeMoveType, sourceShape?: Shape, targetShape?: Shape) {
    console.log('changeRelationshipEnds', edgeShape, sourceShape, targetShape, waypoint);
    shapeService.changeRelationshipEnds({
      shapeId: edgeShape.id,
      projectId: this.projectId,
      waypoint,
      moveType,
      shapeSourceId: sourceShape?.id,
      shapeTargetId: targetShape?.id,
    })
  }
}