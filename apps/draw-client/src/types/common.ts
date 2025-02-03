import { SiderbarItemKey } from "@hfdraw/types";

export interface HeadItem {
    label: string;
    notShowLabel: boolean
    icon: string;
    value: string;
    hide?:  boolean
    disabled?:  boolean
}

export interface ShowData {
    name: string;
    icon: string;
    siderBarkey: SiderbarItemKey
}
export interface SiderBarItem {
    modelId: string;
    showData: ShowData
}


/**
 * 通用菜单类型
 */
export type MenuItem = {
    label?: string;
    value: string;
    icon?: string
    children?: MenuItem[];
    disabled?: any;
    [p: string]: any // 菜单可以携带其他信息
  
  };