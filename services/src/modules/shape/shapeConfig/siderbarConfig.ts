import { MetaclassType, ShapeKey, SiderbarItemKey, StType } from "@hfdraw/types";
import { SiderBarKeyConfigInterface } from "src/types/sidebar.type";

/**
 * siderbar 对应的原类和构造型以及 shapeKey 映射
 */
export const siderbarKeyConfig: SiderBarKeyConfigInterface = {
    [SiderbarItemKey.Block]: {
        metaclass: MetaclassType.Class,
        stereotype: [StType["SysML::Blocks::Block"]],
        operation: '',
        shapeKey: ShapeKey.Block
      },
}