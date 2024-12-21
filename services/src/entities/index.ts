import { ApplicationProject } from "./applicationProject.entity";
import { Project } from "./project.entity";
import { ShapeEntity } from "./shape.entity";
import { StepEntity } from "./step.entity";


export const SystemEntityList = [ 
    ApplicationProject,
    ShapeEntity,
    StepEntity
]
export const ProjectEntityList = [
    Project,
    ShapeEntity,
    StepEntity
]