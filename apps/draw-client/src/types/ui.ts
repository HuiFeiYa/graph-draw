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
}