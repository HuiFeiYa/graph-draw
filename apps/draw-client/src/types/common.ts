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