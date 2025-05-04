export enum StepType {
    /**
     * 编辑模型/图形的产生的步骤
     */
    edit='edit',
    /**
     * undo的步骤
     */
    undo="undo",
    /**
     * redo的步骤
     */
    redo="redo"
  }
  export enum ChangeType {
    INSERT = 1, // 插入对象
    UPDATE = 2, // 更新某个或多个字段
    DELETE = 3, // 删除对象
  }
  export class Change {

    type!: ChangeType;
  
    table!: string; // 更改的表名 实体的tableName
  
    objectId!: number; // 更新的对象id_,删除和创建都是软删除，只变更isDelete
    elementId?:string // 模型的id或者图形的id
  
    oldValue?: {[p:string]:any}; // 更新前的key-value对象的 json串，只记录变更的字段即可，undo的时候会用这个keyValue去update对应的table
  
    newValue?: {[p:string]:any}; // 更新后的key-value对象的 json串，只记录变更的字段即可，redo的时候会用这个keyValue去update对应的table
  
  }
  

  export type Step = {

    // id_: string;
  
    projectId: string; // 项目id
  
    changes: Change[]; // node层的changeId
  
    stepType: StepType // 区分 undo redo 
  
  }
  
export type StepMessageData = {
    projectId: string,
    step: Step,
    stepType: StepType
    affectShapes: ShapeData[]
    // extraUpdateModelIds: string[]
    // stepStatus?: StepStatus
  }

  export type ShapeData = {
    id_: number
    id: string
    parentId: string,
    shapeType: string
    subShapeType: string
    projectId: string
  }

  