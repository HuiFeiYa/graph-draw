import { GraphModel } from "@hfdraw/graph";
import { MoveModel } from "@hfdraw/graph/src/models/MoveModel";
import { IGraphOption } from "@hfdraw/graph/src/types";

export class GraphOption implements IGraphOption {
  graph!: GraphModel;
  constructor(public projectId: string) {

  }
  async customEndMove(moveModel: MoveModel, dx: number, dy: number) {
    const movingShapes = moveModel.movingShapes;
    await Promise.all([
      // shapeService.moveShape(this.projectId, this.graph.rootShape!.id, movingShapes.map(it => it.id), dx, dy),
      // stepMessageHandler.waitNextStep()
    ]);
  }
}