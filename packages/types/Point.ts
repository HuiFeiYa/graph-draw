import { cloneDeep } from 'lodash';
import { IPoint } from "./Bounds";

// 本地实现 int 函数，避免跨包导入
function int(num: number | string) {
  return Math.round(+num);
}

export class Point {

    constructor(public x = 0, public y = 0) {}
  
    toInt() {
      this.x = int(this.x);
      this.y = int(this.y);
      return this;
    }
    clone() {
      return cloneDeep(this);
    }
    translate(dx: number, dy: number) {
      this.x += dx;
      this.y += dy;
    }
  
  }

  export const toIntPoint = (p:IPoint) => {
    p.x = int(p.x);
    p.y = int(p.y);
    return p;
  };