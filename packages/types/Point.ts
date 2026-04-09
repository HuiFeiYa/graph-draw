
import { IPoint } from "./Bounds";
// @ts-ignore
function cloneDeep<T>(obj: T, map = new WeakMap()): T {
  // 处理原始类型
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // 处理日期对象
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T;
  }

  // 处理正则表达式对象
  if (obj instanceof RegExp) {
    return new RegExp(obj) as unknown as T;
  }

  // 处理 DOM 元素
  if (obj instanceof Element) {
    return obj.cloneNode(false) as unknown as T;
  }

  // 防止循环引用
  if (map.has(obj as object)) {
    return map.get(obj as object) as T;
  }

  // 创建新对象/数组
  const clone = Array.isArray(obj) 
    ? [] 
    : ({} as Record<string, unknown>);

  // 记录已处理对象
  map.set(obj as object, clone);

  // 递归复制属性
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      (clone as Record<string, unknown>)[key] = cloneDeep(
        (obj as Record<string, unknown>)[key], 
        map
      );
    }
  }

  return clone as T;
}
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