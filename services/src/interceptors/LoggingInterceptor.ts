import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import * as AsyncLock from 'async-lock';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { RequestLog } from './dto';
import { loggerUtils } from '../utils/LoggerUtils';
import { LogData } from '../types/common';

const writeLogLock = new AsyncLock({ maxPending: 10000000000 });

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();
    const log = new RequestLog(req);
    
    // 记录请求开始
    loggerUtils.logToFile(new LogData(
      `请求开始 - ${req.method} ${req.url}`,
      'log'
    ));
    
    console.log('NODE REQUEST:', log.url, log.body);
    
    return next.handle()
      .pipe(
        tap((responseData) => {
          log.useTime = Date.now() - log.time;
          
          // 记录响应成功
          loggerUtils.logToFile(new LogData(
            `响应成功 - ${req.method} ${req.url} (${res.statusCode}) - ${log.useTime}ms`,
            'log'
          ));
          
          console.log('NODE RESPONSE:', log.url, log.body, 'useTime = ' + log.useTime);
          this.writeLog(log); // 实际调用写入日志
        }),
        catchError((error) => {
          log.useTime = Date.now() - log.time;
          
          // 记录响应错误
          loggerUtils.logToFile(new LogData(
            `响应错误 - ${req.method} ${req.url} - ${log.useTime}ms: ${error.message}`,
            'error'
          ));
          
          throw error;
        })
      );
  }

  writeLog(log: RequestLog) {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const logMessage = `[${timestamp}] [REQUEST] ${log.method} ${log.url} - ${log.useTime}ms\n    Body: ${JSON.stringify(log.body)}`;
    
    // 使用 loggerUtils 而不是直接使用 resourceUtil
    loggerUtils.logToFile(new LogData(
      `请求日志 - ${log.method} ${log.url} - ${log.useTime}ms`,
      'log'
    ));
  }
}