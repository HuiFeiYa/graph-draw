import { Shape, VertexType } from "@hfdraw/types"
import { SidebarKeyItem } from "../constants/config"

export enum PopoverListItemType  {
    'vertical' = 'vertical',
     'horizontal' = 'horizontal'
}
export interface PopoverListItem {
    type: PopoverListItemType
    x: number
    y: number
    list: SidebarKeyItem[]
    index: VertexType
    shape: Shape
}