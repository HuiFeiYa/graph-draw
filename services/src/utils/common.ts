import { Base36 } from "./Base36";

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