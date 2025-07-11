import { ModelKey, SidebarOptions } from "src/types/model.type";
import { shapeFactory } from "./ShapeFactory";
import { shapeUtil } from "src/utils/shape/ShapeUtil";
import { Model } from "src/entities/model.entity";
import { ModelUtil } from "src/utils/ModelUtil";
import { ShapeEntity } from "src/entities/shape.entity";
import { Point } from "src/utils/Point";
import { ShapeType, SiderbarItemKey, StType } from "@hfdraw/types";
import { StepManager } from "src/utils/StepManager";
export class SidebarModel {
    createdMainModel:Model
    projectId: string
    diagramId: string
    shapeParentId: string
    createdShapes:Set<ShapeEntity> = new Set()
    createdModels:Set<Model> = new Set()
    modelKey:ModelKey
    point: Point;
    constructor (public stepManager: StepManager,options: SidebarOptions) {
        const { projectId, point, stType  } = options
        this.projectId = projectId
        this.point = point
        this.modelKey = stType
    }
    async run() {
        await this.createShape();
    }
    async createShape() {
        const { projectId, diagramId, shapeParentId, modelKey } = this
        const shapeOption = shapeFactory.getModelShapeOption(modelKey);
        const shape = ShapeEntity.fromOption(shapeOption, projectId);
        const project = await this.stepManager.projectRep.findOne({where: {projectId}});
        // 如果更新了项目配置，则使用更新后的配置
        if (project) {
            if (shape.shapeType === ShapeType.Edge) {
                shape.style = {
                    ...shape.style,
                    strokeColor: project.commonConfig?.style.strokeColor || 'rgba(21,71, 146,0.5)',
                }
            } else {
                shape.style = {
                    ...shape.style,
                    ...(project.commonConfig?.style||{})
                }
            }
        }
        shapeUtil.initShape(shape, this.point);
        this.createdShapes.add(shape);
    }
    async saveAllEntity() {

    }
}