import { MetaclassType, SiderbarItemKey } from "@hfdraw/types";

export interface SiderbarItemKeyConfig {
    metaclass: MetaclassType | null;
    stereotype: string[];
    operation: string;
    shapeKey: string;
  }
  export type SiderBarKeyConfigInterface = {
    [key in SiderbarItemKey]?: SiderbarItemKeyConfig
  }
  