import { float, int } from "../common";
import { Point } from "../Point";

export function getLineCenter(pts:Point[], useFloat?:boolean) {
    let total = 0;
    const lens:number[] = [];
    for (let i = 1; i < pts.length; i++) {
      const a2 = Math.pow(pts[i].x - pts[i - 1].x, 2);
      const b2 = Math.pow(pts[i].y - pts[i - 1].y, 2);
      let len = Math.sqrt(a2 + b2);
      // let len = Math.sqrt(a2+b2)(Math.pow(pts[i].x - pts[i - 1].x) + Math.pow(pts[i].y - pts[i - 1].y) );
      lens.push(len);
      total += len;
    }
    let half = total / 2;
    for (let i = 1; i < pts.length; i++) {
  
      if (half > lens[i - 1]) {
        half -= lens[i - 1];
      } else {
        let t = half / lens[i - 1];
        let x = pts[i - 1].x + (pts[i].x - pts[i - 1].x) * t;
        let y = pts[i - 1].y + (pts[i].y - pts[i - 1].y) * t;
        return {
          x: useFloat ? float(x) : int(x),
          y: useFloat ? float(y) : int(y),
          startPoint: pts[i - 1],
          endPoint: pts[i]
        };
      }
    }
  }