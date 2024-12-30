import { Shape, VertexType } from "@hfdraw/types"
import { SiderBarItem } from "./common"

export enum PopoverListItemType  {
    'vertical' = 'vertical',
     'horizontal' = 'horizontal'
}
export interface PopoverListItem {
    type: PopoverListItemType
    x: number
    y: number
    list: SiderBarItem[]
    index: VertexType
    shape: Shape
}