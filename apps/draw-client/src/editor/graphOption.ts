import { GraphModel } from "@hfdraw/graph";
import { MoveModel } from "@hfdraw/graph/src/models/MoveModel";
import { IGraphOption } from "@hfdraw/graph/src/types";
import { shapeService } from "../util/ShapeService";
import { Shape, VertexType } from "@hfdraw/types";
import { useUiStore } from "../stores/ui";
import { SideBarWidth, popoverGap, popoverHeight, popoverList, popoverWidth } from "../constants/config";
import { PopoverListItem, PopoverListItemType } from '../types/ui'

export class GraphOption implements IGraphOption {
  graph!: GraphModel;
  constructor(public projectId: string) {

  }
  async customEndMove(moveModel: MoveModel, dx: number, dy: number) {
    if (dx === 0 && dy === 0) {
      return 
    }
    const movingShapes = moveModel.movingShapes;
    const shapeIds = movingShapes.map(it => it.id);
    await shapeService.moveShape({
      projectId: 'p1', shapeIds, dx, dy
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
      list: popoverList
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
}