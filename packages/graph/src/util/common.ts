import { Bounds } from "@hfdraw/types";
import { ApiCode } from "./constant";

export function int(num:number|string) {
    return Math.round(+num);
  }

  export enum VertexType {
    leftTop=1,
    rightTop=2,
    rightBottom=3,
    leftBottom=4,
    left=5,
    top=6,
    right=7,
    bottom=8
  }

  export const StrokeColor = 'rgba(21,71,146,0.5)';


  export function equalBounds(bounds1: Bounds, bounds2: Bounds) {
    return bounds1.x === bounds2.x && bounds1.y === bounds2.y && bounds1.width === bounds2.width && bounds1.height === bounds2.height && bounds1.absX === bounds2.absX && bounds1.absY === bounds2.absY;
  }
  export class ResData<T> {
    code = 1000
    message = ''
    data?: T
    title = ''
    constructor(code:ApiCode, data?: T, message?:string) {
      this.data = data;
      this.code = code || ApiCode.SUCCESS;
      this.message = message || 'success';
    }
  }