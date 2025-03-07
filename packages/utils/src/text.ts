import { charWidthConfig } from "./constant";

/**
 * 计算文本的高度
 * @param {string} text - 需要计算高度的文本内容
 * @param {number} containerWidth - 容器的宽度（单位：px）
 * @param {number} [charWidth=8] - 单个字符的估计宽度（单位：px，默认值为8）
 * @param {number} [fontSize=12] - 字体大小（单位：px，默认值为12）
 * @param {number} [lineHeight=1.5] - 行高（倍数，默认值为1.5）
 * @returns {number} - 计算出的文本高度（单位：px）
 */
export function calculateTextHeight(text:string, containerWidth:number, fontSize = 12,charWidth=12,  lineHeight = 1.5) {
    // 计算每行能容纳的字符数
    const charsPerLine = Math.floor(containerWidth / charWidth);

    // 计算总行数
    const totalChars = text.length;
    const totalLines = Math.ceil(totalChars / charsPerLine);
  
    // 计算总高度
    const totalHeight = totalLines * (fontSize * lineHeight);
  
    return totalHeight;
  }



  

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
    const lineHeight = 1.5;
    const oneLineHeight = fontSize * lineHeight;
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