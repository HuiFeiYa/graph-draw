export interface StyleObject {
    fontWeight?: number
    fontSize?: number
    strokeColor?: string
    strokeWidth?: number
    borderRadius?: number;
    strokeDasharray?: string
    background?: string
    /** 连接线才有的属性 */
    sourceConnection?: [number, number]
    targetConnection?: [number, number]
    arrowStyle?: {
        hasStart?: boolean
        hasEnd?: boolean
        // 其他样式例如实心还是其他
        fillStart?: string
        fillEnd?: string
    }
    retrospectOption?:RetrospectOption
    stroke?: string
}

export interface RetrospectRelationType {
    id: string, // 跟哪个模型有关联关系
    key: string // 关系的key
    labels: string[]
  }
  export interface RetrospectOption {
    expand: boolean, // 是否展开
    shapeDepth: number // 图形层级
    parentNodeId: string // 上连接线的图形id
    relationTypes: RetrospectRelationType[]
    isPort?: boolean // 是否是端口，用于显示属性
  }