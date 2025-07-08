import { ApplicationProject } from "./applicationProject.entity";
import { CurrentStep } from "./currentStep.entity";
import { Project } from "./project.entity";
import { ShapeEntity } from "./shape.entity";
import { StepEntity } from "./step.entity";

// 系统级实体列表 - 用于主数据库
export const SystemEntityList = [ 
    ApplicationProject,
    Project,
    ShapeEntity,
    StepEntity,
    CurrentStep
];

// 项目级实体列表 - 用于项目数据库
export const ProjectEntityList = [
    ShapeEntity,
    StepEntity,
    CurrentStep,
];