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
  

  