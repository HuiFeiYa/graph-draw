import { VerHor } from "./constant";

export interface StyleObject {
    fontWeight?: number
    fontSize?: number
    strokeColor?: string
    strokeWidth?: number
    borderRadius?: number;
    strokeDasharray?: string
    background?: string
    /** 连接线才有的属性 */
    sourceConnection?: [number, number] | null
    targetConnection?: [number, number] | null
    sourceId?: string | null // 连接线的起点图形id
    targetId?: string | null// 连接线的终点图形id
    /** 箭头样式 */
    arrowStyle?: {
        hasStart?: boolean
        hasEnd?: boolean
        // 其他样式例如实心还是其他
        fillStart?: string
        fillEnd?: string
    }
    retrospectOption?:RetrospectOption
    stroke?: string
    minWidth?: number
    minHeight?: number
    paddingTop?: number
    paddingLeft?: number
    paddingBottom?: number
    paddingRight?: number
    rightAngle?: boolean
    edgeDirection?:VerHor
    bold?: boolean
    italic?: boolean
    underline?: boolean
}

export interface RetrospectRelationType {
    shapeId: string // 跟哪个图形有关联
    key?: string // 关系的线的key
  }
  export interface RetrospectOption {
    expand: boolean, // 是否展开
    shapeDepth: number // 图形层级
    parentNodeId: string // 上连接线的图形id
    relationTypes: RetrospectRelationType[]
    isPort?: boolean // 是否是端口，用于显示属性
  }