import { HttpException, HttpStatus } from "@nestjs/common";
import { ApiCode } from "./ApiCode";
import { ErrorLevel } from "src/constants";


/**
 * 异常包装类，给前端返回的异常统一使用此类
 */
export class ResException extends HttpException {

  constructor(public code: ApiCode, public message: string, public title = '', public data?:any, statusCode: number = HttpStatus.OK, public errorLevel = ErrorLevel.ERROR) {
    super(undefined, statusCode);

  }
}