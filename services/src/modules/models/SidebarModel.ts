import { ModelKey, SidebarOptions } from "src/types/model.type";
import { shapeFactory } from "./ShapeFactory";
import { shapeUtil } from "src/utils/shape/ShapeUtil";
import { Model } from "src/entities/model.entity";
import { ModelUtil } from "src/utils/ModelUtil";
import { ShapeEntity } from "src/entities/shape.entity";
import { Point } from "src/utils/Point";
import { SiderbarItemKey, StType } from "@hfdraw/types";

export class SidebarModel {
    createdMainModel:Model
    projectId: string
    diagramId: string
    shapeParentId: string
    createdShapes:Set<ShapeEntity> = new Set()
    createdModels:Set<Model> = new Set()
    modelKey:ModelKey
    point: Point;
    sourceType: SiderbarItemKey
    constructor (options: SidebarOptions) {
        const { projectId, diagramId, point, sourceType  } = options
        this.projectId = projectId
        this.diagramId = diagramId
        this.point = point
        this.sourceType = sourceType
        this.modelKey = StType["SysML::Blocks::Block"]
    }
    async run() {
        // await this.createModel()
        await this.createShape();
        // await this.saveAllEntity();
    }
    // async createModel() {
    //     const res = await ModelUtil.createInstance(this.options)
    //     this.createdMainModel = res;
    //     this.createdModels.add(res);
    // }
    async createShape() {
        const { projectId, diagramId, shapeParentId, modelKey } = this
        const shapeOption = shapeFactory.getModelShapeOption(modelKey);
        const shape = ShapeEntity.fromOption(shapeOption, projectId, diagramId, shapeParentId||diagramId);
        shapeUtil.initShape(shape, this.point);
        this.createdShapes.add(shape);
    }
    async saveAllEntity() {

    }
}