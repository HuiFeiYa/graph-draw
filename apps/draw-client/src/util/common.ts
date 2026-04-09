import { ApiCode } from "@hfdraw/types";

export function generateRandomNumber(length = 5) {
    // 生成一个 0 到 99999 之间的随机整数
    const randomNumber = Math.floor(Math.random() * Math.pow(10, length));
    
    // 将数字转换为字符串，并确保长度为 5 位，不足的部分用 '0' 填充
    return randomNumber.toString().padStart(length, '0');
  }
  

  /**
   * 日期格式化
   * @param date 日期对象或时间戳
   * @param format 格式化字符串，如 'yyyy-MM-dd HH:mm:ss'
   * @returns 格式化后的日期字符串
   */
  export function formatDate(date: Date | number, format: string = 'yyyy-MM-dd HH:mm'): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0'); // 月份从0开始，需要加1并 补零 
    const day = d.getDate().toString().padStart(2, '0'); // 日期 补零
    const hours = d.getHours().toString().padStart(2, '0'); // 小时 补零
    const minutes = d.getMinutes().toString().padStart(2, '0'); // 分钟 补零
    const seconds = d.getSeconds().toString().padStart(2, '0'); // 秒 补零

    return format.replace('yyyy', year.toString())
                 .replace('MM', month)
                 .replace('dd', day)
                 .replace('HH', hours)
                 .replace('mm', minutes)
  }



  export class ResData<T> {
    code = 1000
    message = ''
    data?: T
    title = ''
    constructor(code:ApiCode, data?: T, message?:string) {
      this.data = data;
      this.code = code || ApiCode.SUCCESS;
      this.message = message || 'success';
    }
  }