export enum ApiCode {
  /**
   * 操作成功
   */
  SUCCESS = 1000,

  ERROR = 1001,
  INTERNAL_ERROR = 1002,
  NO_TIP_ERROR = 1003, // 抛出异常，但是页面无需异常提示
}