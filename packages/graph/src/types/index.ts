import { Shape } from "@hfdraw/types";
import { MoveModel } from "../models/MoveModel";
import { GraphModel } from "../models/GraphModel";
import { VertexType } from "../util/common";

export interface GraphProps {
    edges: Shape[],
    symbols: Shape[]
    graph: GraphModel
}

export interface IGraphOption {
    graph: GraphModel // 执行对应 graphModel 实例
    customEndMove(moveModel: MoveModel, dx: number, dy: number): Promise<any>
    showPopover(index: VertexType, shape: Shape):void
}