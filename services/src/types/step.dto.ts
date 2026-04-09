export interface UpdateStepDto {
    stepSize?: number; // step的总数
    stepId?:string
    projectId?:string
    index?:number
}

export interface CreateStepDto {
    stepId:string
    projectId:string
    index: number
    stepSize: number
}