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
        fill?: string
    }
}