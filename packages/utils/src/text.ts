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