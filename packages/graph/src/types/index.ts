import { IBounds, Shape, StyleObject } from "@hfdraw/types";
import { MoveModel } from "../models/MoveModel";
import { GraphModel } from "../models/GraphModel";
import { ResData, VertexType } from "../util/common";
import { Point } from "../util/Point";

export interface GraphProps {
  edges: Shape[];
  symbols: Shape[];
  graph: GraphModel;
}

export interface IGraphOption {
  graph: GraphModel; // 执行对应 graphModel 实例
  scale: number; // 缩放比例
  customEndMove(moveModel: MoveModel, dx: number, dy: number): Promise<any>;
  showPopover(index: VertexType, shape: Shape): void;
  EdgePointEndMove(
    shapeId: string,
    waypoint: Point[],
    styleObject: StyleObject
  ): void;
  addMindMapRect(index: VertexType, shape: Shape): void;
  saveText(shape: Shape, text: string): Promise<void>;
  expandShape(shapeId: string, expand: boolean): Promise<void>;
  /**
   * 图形缩放
   */
  onShapeResized?: (
    shape: Shape,
    vertexType: VertexType,
    newBounds: IBounds
  ) => Promise<any>;
  getMinimumBounds?: (shape: Shape, resizeIndex: VertexType) => Promise<ResData<IBounds>>;
  // 缩放相关方法
  setScale(newScale: number): void;
  zoomIn(): void;
  zoomOut(): void;
  handleWheel(event: WheelEvent): void;
}

export enum MovePointPosition {
  start = 0,
  end = 1,
}
