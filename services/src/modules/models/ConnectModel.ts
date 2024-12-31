import { Shape, ShapeKey, SiderbarItemKey, StType, siderbarItemKeyToStTypeMap } from "@hfdraw/types";
import { PointDto } from "src/types/shape.dto";
import { connectConfig } from "../shape/shapeConfig/connectConfig";
import { shapeFactory } from "./ShapeFactory";
import { shapeUtil } from "src/utils/shape/ShapeUtil";
import { ShapeEntity } from "src/entities/shape.entity";

export class ConnectModel {
    createdShapes: Set<ShapeEntity> = new Set()

    constructor(public projectId: string,  public stType: StType, public waypoint:PointDto[], public sourceShape:ShapeEntity , public targetShape: ShapeEntity) {
      }
    // 受影响的图形（增删改的图形）
    // public createdShapes: Set<Shape>
    async connectShape():Promise<void> {
        await this.createShape();
      }
      async createShape() {
        // const matched = connectConfig.find(item => item.edgeKeys.includes(this.edgeKey));
        // if (matched) {
            const { projectId, stType } =this
            // const stType = siderbarItemKeyToStTypeMap[this.edgeKey];
            const shapeOption = shapeFactory.getModelShapeOption(stType);
            const shape = ShapeEntity.fromOption(shapeOption, projectId);
            shapeUtil.initEdgeShape(this.sourceShape, this.targetShape, shape, this.waypoint);
        // }
        // const validSource = await behavior.isValidSource();
        // const validTarget = await behavior.isValidTarget();
        this.createdShapes.add(shape);
      }
}