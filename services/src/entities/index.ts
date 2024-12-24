import { ApplicationProject } from "./applicationProject.entity";
import { CurrentStep } from "./currentStep.entity";
import { Project } from "./project.entity";
import { ShapeEntity } from "./shape.entity";
import { StepEntity } from "./step.entity";


export const SystemEntityList = [ 
    ApplicationProject,
    ShapeEntity,
    StepEntity,
    CurrentStep
]
export const ProjectEntityList = [
    Project,
    ShapeEntity,
    StepEntity,
    CurrentStep
]