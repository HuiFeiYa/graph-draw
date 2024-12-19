export interface IBounds {
    absX: number;
    absY: number;
    x: number;
    y: number;
    width: number;
    height: number;
  }

  
  export interface IPoint {
    x:number
    y:number
  }

  export class Bounds implements IBounds {

    constructor(public x = 0, public y = 0, public width = 0, public height = 0, public absX = 0, public absY = 0) {
  
    }
  
  }