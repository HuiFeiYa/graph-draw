import { ArrowLineHandleKey } from "./common-enum";
import { RectangleClient } from "./rectangle-client";

export enum Direction {
    left = "left",
    top = "top",
    right = "right",
    bottom = "bottom"
}
export type Vector = [number, number];
export type DirectionFactor = -1 | 0 | 1;
export type DirectionFactors = [DirectionFactor, DirectionFactor];


/**
 * [x, y] x,y between 0 and 1
 * represents a point in the rectangle
 */
export type PointOfRectangle = [number, number];
export interface ArrowLineHandle {
    // The id of the bounded element
    boundId?: string;
    connection: PointOfRectangle;
}
export interface PlaitElement {
    [key: string]: any;
    points?: ElbowPoint[];
    source: ArrowLineHandle;
    target: ArrowLineHandle;
}

export type ElbowPoint = [number, number];
export interface IPoint {
    x:number
    y:number
  }

export interface ArrowLineHandleRef {
    key: ArrowLineHandleKey;
    direction: Direction;
    point: PointOfRectangle;
    vector: Vector;
}


export interface ArrowLineHandleRefPair {
    source: ArrowLineHandleRef;
    target: ArrowLineHandleRef;
}

export interface ElbowLineRouteOptions {
    sourcePoint: ElbowPoint;
    nextSourcePoint: ElbowPoint;
    sourceRectangle: RectangleClient;
    sourceOuterRectangle: RectangleClient;
    targetPoint: ElbowPoint;
    nextTargetPoint: ElbowPoint;
    targetOuterRectangle: RectangleClient;
    targetRectangle: RectangleClient;
}

export interface RouteAdjustOptions {
    centerX?: number;
    centerY?: number;
    sourceRectangle: RectangleClient;
    targetRectangle: RectangleClient;
}

export interface AdjustOptions {
    parallelPaths: [ElbowPoint, ElbowPoint][];
    pointOfHit: ElbowPoint;
    sourceRectangle: RectangleClient;
    targetRectangle: RectangleClient;
}