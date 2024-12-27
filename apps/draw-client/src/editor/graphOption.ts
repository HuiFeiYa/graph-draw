import { GraphModel } from "@hfdraw/graph";
import { MoveModel } from "@hfdraw/graph/src/models/MoveModel";
import { IGraphOption } from "@hfdraw/graph/src/types";
import { shapeService } from "../util/ShapeService";
import { Shape, VertexType } from "@hfdraw/types";
import { useUiStore } from "../stores/ui";
import { SideBarWidth, popoverGap, popoverList, popoverWidth } from "../constants/config";
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
    const { x, y, height } = shape.bounds;

    let item:PopoverListItem = {
      type: [VertexType.top, VertexType.bottom].includes(index) ? PopoverListItemType.horizontal : PopoverListItemType.vertical,
      x: x + SideBarWidth,
      y: y ,
      list: popoverList
    }
    switch(index) {
      case VertexType.left: {
        item.x = item.x - popoverGap - popoverWidth;
        item.y += height / 2;
        break;
      }
      case VertexType.top: {

      }
    }
    store.setPopoverList([item])
  }
}