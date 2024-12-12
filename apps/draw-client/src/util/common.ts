export function generateRandomNumber(length = 5) {
    // 生成一个 0 到 99999 之间的随机整数
    const randomNumber = Math.floor(Math.random() * Math.pow(10, length));
    
    // 将数字转换为字符串，并确保长度为 5 位，不足的部分用 '0' 填充
    return randomNumber.toString().padStart(length, '0');
  }
  