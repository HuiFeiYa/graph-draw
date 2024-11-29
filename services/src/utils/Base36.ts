let CHARSET = "0123456789abcdefghijklmnopqrstuvwxyz".split("");
const size = CHARSET.length;
// NB: does not validate input
export class Base36 {
  static encode(int:number) {
    if (int === 0) {
      return CHARSET[0];
    }

    let res = "";
    while (int > 0) {
      res = CHARSET[int % size] + res;
      int = Math.floor(int / size);
    }
    return res;
  }
  static decode(str:string) {
    let res = 0,
      length = str.length,
      i, char;
    for (i = 0; i < length; i++) {
      char = str.charCodeAt(i);
      if (char < 58) { // 0-9
        char = char - 48;
      } else if (char < 91) { // A-Z
        char = char - 29;
      } else { // a-z
        char = char - 87;
      }
      res += char * Math.pow(36, length - i - 1);
    }
    return res;
  }
}
