import { Model } from "src/entities/model.entity";
import { createModelOptions } from "src/types/model.type";

export class ModelUtil {
    static async createInstance(options:createModelOptions) {
        return new Model()
    }
}