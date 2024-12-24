import { GraphModel } from "@hfdraw/graph";
import { MoveModel } from "@hfdraw/graph/src/models/MoveModel";
import { IGraphOption } from "@hfdraw/graph/src/types";
import { shapeService } from "../util/ShapeService";

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
}