import { Bounds } from "@hfdraw/types";
import { Base36 } from "./Base36";
import { Point } from "./Point";

/**
 * 获取唯一的id，以时间为基准，
 */
export const getUid = (() => {
    let now = '';
    let random = '';
    let index = 0;
    let p = '';
    const reset = () => {
      now = Base36.encode(Date.now() - 1634869060000);
      random = Base36.encode(parseInt(Math.random() * 10000 + ''));
      index = 0;
      p = `${now}-${random}-`;
    };
    reset();
    return () => {
      if (index >= Number.MAX_SAFE_INTEGER) {
        reset();
      }
      index++;
      return `${p}${Base36.encode(index)}`;
  
    };
  })();
  
  export interface ITreeNode {

    children?: ITreeNode[]
  
    [prop: string]: any
  
  }
  export async function treeForEachAsync<T extends ITreeNode>(tree: T[], fn: (node: T, parent?: T, index?:number) => Promise<boolean|void|'stopChildren'>, childrenKey = 'children', parent?: T) {

    for (let curNode of tree) {
      // const curNode = tree[i];
      const result = await fn(curNode, parent);
      if (result === false) return false;
      if (result === 'stopChildren') return;
      const children = curNode?.[childrenKey];
      if (children?.length) {
        const result2 = await treeForEachAsync(children, fn, childrenKey, curNode);
        if (result2 === false) {
          return false;
        }
      }
  
    }
  }

  

  export function pickProp<T>(obj: T, props: (keyof T)[]) {
    const result = {} as Partial<T>;
    props.forEach(prop => {
      result[prop] = obj[prop];
    });
    return result;
  }


  /**
 * 数组分段
 * @param arr
 * @param size 每段的长度
 * @returns
 */
export function breakArray<T>(arr:T[], size = 300) {
  const result:T[][] = [];
  const length = arr.length;

  let index = 0;
  while (index * size < length) {
    result.push(arr.slice(size * index, size * (index + 1)));
    index++;
  }
  return result;

}

export function equalBounds(bounds1: Bounds, bounds2: Bounds) {
  return bounds1.x === bounds2.x && bounds1.y === bounds2.y && bounds1.width === bounds2.width && bounds1.height === bounds2.height && bounds1.absX === bounds2.absX && bounds1.absY === bounds2.absY;
}


/**
 * 四舍五入转小数，默认保留两位小数
 * @param num
 * @returns
 */
export function float(num:number, precision = 2) {
  return parseFloat(num.toFixed(precision));
}

/**
 * 四舍五入转整数
 * @param num
 * @returns
 */
export function int(num:number|string) {
  return Math.round(+num);
}

export function getBoundsCenterPoint(bounds:Bounds) {
  const x = bounds.absX + bounds.width / 2;
  const y = bounds.absY + bounds.height / 2;
  return new Point(x, y);
}

export function getBoundsBorderCenterPoint(bounds:Bounds) {
  let center = getBoundsCenterPoint(bounds);
  return {
    top: new Point(center.x, bounds.absY),
    left: new Point(bounds.absX, center.y),
    right: new Point(bounds.absX + bounds.width, center.y),
    bottom: new Point(center.x, bounds.absY + bounds.height),

  };

}



/**
 * 格式化时间
 * @param {string|number|Date} time - 时间参数，可以是时间戳、日期字符串或Date对象
 * @param {string} format - 格式字符串，默认为'YYYY-MM-DD HH:mm:ss'
 * @returns {string} 格式化后的时间字符串
 */
export const formatTime = (time: string | number | Date, format = 'YYYY-MM-DD HH:mm:ss'): string => {
  if (!time) return '';
  
  const date = new Date(time);
  if (isNaN(date.getTime())) return ''; // 无效日期检查
  
  const padZero = (num: number): string => num.toString().padStart(2, '0');
  
  const year = date.getFullYear();
  const month = padZero(date.getMonth() + 1);
  const day = padZero(date.getDate());
  const hours = padZero(date.getHours());
  const minutes = padZero(date.getMinutes());
  const seconds = padZero(date.getSeconds());
  
  // 替换格式字符串中的占位符
  return format
    .replace('YYYY', year.toString())
    .replace('YY', year.toString().slice(-2))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
};