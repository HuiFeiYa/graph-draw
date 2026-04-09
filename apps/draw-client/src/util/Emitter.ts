/**
 * 事件发射器
 */
export class Emitter {
    /**
     * 事件池，key是事件名称，value是要执行的函数组
     */
    private readonly store:{[evtName:string]:Function[]} = {};
    /**
     * 监听一个事件
     * @param event
     * @param callback
     */
    on(event:string|number, callback:Function) {
      // if (!this.allowUnknownEvent && !eventPool[event] ) console.warn('未定义的事件名: ' + event + ',请注册到util/emitter eventPool中');
      if (!this.store[event]) {
        this.store[event] = [];
      }
      this.store[event].push(callback);
    }
    /**
     *  监听一个事件,只监听一次
     * @param event
     * @param callback
     */
    once(event:string|number, callback:Function) {
      const fn = (...args:any[]) => {
        this.off(event, fn);
        callback(...args);
      };
      this.on(event, fn);
    }
    /**
     * 批量监听事件
     * @param obj
     */
    onBatch(obj:{[evtName:string]:Function}) {
      Object.keys(obj).forEach(key => {
        this.on(key, obj[key]);
      });
    }
    /**
     * 取消监听一个事件
     * @param event
     * @param callback
     * @returns
     */
    off(event:string|number, callback:Function) {
      if (!event || !callback) return;
      const arr = this.store[event];
      if (!arr) return;
      const index = arr.indexOf(callback);
      if (index > -1) {
        arr.splice(index, 1);
        if (arr.length == 0) {
          delete this.store[event];
        }
      }
  
    }
    /**
     * 批量取消监听事件
     * @param event
     * @param callback
     * @returns
     */
    offBatch(obj:{[evtName:string]:Function}) {
      Object.keys(obj).forEach(key => {
        this.off(key, obj[key]);
      });
    }
    /**
     * 发射一个事件
     * @param event
     * @param params
     * @returns
     */
    emit(event:string|number, ...params:any[]) {
      if (!this.store[event]) return;
      Array.from(this.store[event]).forEach(callback => {
        try {
          callback(...params);
        } catch (e) {
          console.error(e);
        }
      });
    }
  
  }
  
  export const emitter = new Emitter();
  
  