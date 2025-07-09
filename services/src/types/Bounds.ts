import { IBounds } from "@hfdraw/types";

export class Bounds implements IBounds {

    constructor(public x = 0, public y = 0, public width = 0, public height = 0, public absX = 0, public absY = 0) {
  
    }
  
  }