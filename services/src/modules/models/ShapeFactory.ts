import { cloneDeep } from "lodash";
import { ModelKey, ShapeOption } from "src/types/model.type";
import { modelKeyConfig } from "../shape/shapeConfig/shapeConfig";
export class ShapeFactory {
    getModelShapeOption(modelKey:ModelKey):Partial<ShapeOption>|null {
        return cloneDeep(modelKeyConfig[modelKey]); 
    }
}

export const shapeFactory = new ShapeFactory();