import { int } from "./common";

export class Point {

    constructor(public x = 0, public y = 0) {}
  
    toInt() {
      this.x = int(this.x);
      this.y = int(this.y);
      return this;
    }
  
    translate(dx: number, dy: number) {
      this.x += dx;
      this.y += dy;
    }
  
  }