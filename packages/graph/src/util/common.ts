import { charWidthConfig } from "./constant";

export function int(num:number|string) {
    return Math.round(+num);
  }

  export enum VertexType {
    leftTop=1,
    rightTop=2,
    rightBottom=3,
    leftBottom=4,
    left=5,
    top=6,
    right=7,
    bottom=8
  }

  export const StrokeColor = 'rgba(21,71,146,0.5)';



  export function getTextWidth(str: string, fontSize: number, fontWeight = 400, fontFamily: keyof typeof charWidthConfig = '微软雅黑', isChangeAnalyse = false) {
    let width = 0;
    let char = '0';
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    fontWeight = fontWeight || 400;
    fontFamily = fontFamily || '微软雅黑';
    if (str === null || str === undefined) {
      return width;
    }
    const scale = (fontSize / 12);
    const oneFontSize = fontSize * 1000;
    for (let i = 0; i < str.length; i++) {
      char = str.charAt(i);
      if (charWidthConfig[fontFamily][char]) {
        width += charWidthConfig[fontFamily][char] * scale;
      } else {
        width += oneFontSize;
      }
    }
    let length = Math.ceil(width / 1000) + 2;
    if (length > 80 && isChangeAnalyse) {
      length = 80;
    }
    return length;
  }
  
  export function getTextSize(text:string, fontSize:number, limitWidth?:number) {
    const strs = text.split('\n');
    const oneLineHeight = fontSize + 2;
    let height = 0;
    let width = 0;
    if (!limitWidth) {
      for (const str of strs) {
        const strWidth = getTextWidth(str, fontSize);
        width = Math.max(width, strWidth);
        height += oneLineHeight;
      }
    } else {
      for (const str of strs) {
        const strWidths = getWrapTextWidths(str, fontSize, limitWidth);
        width = Math.max(...strWidths);
        height += (oneLineHeight * strWidths.length);
  
      }
    }
    if (height < oneLineHeight) {
      height = oneLineHeight;
    }
    return {
      width, height
    };
  
  }


  /**
 * 计算文字在一定的宽度内，可以切割成多少段，每段的长度
 * @param str
 * @param fontSize
 * @param limitWidth
 * @returns
 */
export function getWrapTextWidths(str: string, fontSize: number, limitWidth:number, fontFamily = '微软雅黑'):number[] {
  limitWidth = limitWidth - 2;
  limitWidth = limitWidth * 1000;
  let width = 0;
  let char = '';
  let charSize = 0;
  const widths:number[] = [];
  fontFamily = fontFamily || '微软雅黑';
  if (str === null || str === undefined) {
    return widths;
  }
  const scale = (fontSize / 12);
  const oneFontSize = fontSize * 1000;

  for (let i = 0; i < str.length; i++) {
    char = str.charAt(i);
    if (charWidthConfig[fontFamily][char]) {
      charSize = charWidthConfig[fontFamily][char] * scale;
    } else {
      charSize = oneFontSize;
    }

    if (width + charSize > limitWidth) {
      widths.push(Math.ceil(width) / 1000 + 2);
      width = charSize;

    } else {
      width += charSize;
    }
  }
  widths.push(Math.ceil(width) / 1000 + 2);
  return widths;
}