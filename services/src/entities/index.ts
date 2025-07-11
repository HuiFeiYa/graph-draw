import { ApplicationProject } from "./applicationProject.entity";
import { CurrentStep } from "./currentStep.entity";
import { Project } from "./project.entity";
import { ShapeEntity } from "./shape.entity";
import { StepEntity } from "./step.entity";
import { ProjectTemplate } from './projectTemplate.entity';
import { SnapshotShape } from './snapshotShape.entity';

// 系统级实体列表 - 用于主数据库
export const SystemEntityList = [ 
    ApplicationProject,
    ShapeEntity,
    StepEntity,
    CurrentStep,
    ProjectTemplate,
    SnapshotShape
];

// 项目级实体列表 - 用于项目数据库
export const ProjectEntityList = [
    ShapeEntity,
    StepEntity,
    CurrentStep
];

export * from './projectTemplate.entity';
export * from './snapshotShape.entity';