export class ShapeCompManager {

    map = new Map<string, any>()
  
    /**
     *
     * @param key
     * @param comp 组件
     */
    addShape(key:string, comp: any) {
      this.map.set(key, comp);
      // this.map[comp];
    }
    addShapes(arr:{key:string, comp:any}[]) {
      arr.forEach(it => {
        this.addShape(it.key, it.comp);
       
      });
  
    }
  
    get(key:string) {
      return this.map.get(key);
    }
  }
  

  export const shapeCompManager  = new ShapeCompManager()