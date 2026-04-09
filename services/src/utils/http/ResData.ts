import { ApiCode } from "./ApiCode";

export class ResData<T> {
  code:ApiCode

  message:string
  title=''

  constructor(public data:T = null, code?:ApiCode, message?:string) {
    this.code = code || ApiCode.SUCCESS;
    this.message = message || 'success';
  }

}

export enum ActionStatus {
  /**
   * 操作成功
   */
  SUCCESS = 'success',

  ERROR = 'error',
}