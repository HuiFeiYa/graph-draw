export function int(num:number|string) {
    return Math.round(+num);
  }

  export enum VertexType {
    leftTop=1,
    rightTop=2,
    rightBottom=3,
    leftBottom=4
  }