import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import * as AsyncLock from 'async-lock';
import { Request } from 'express';
import { appendFile } from 'fs/promises';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { RequestLog } from './dto';
import { resourceUtil } from 'src/utils/ResourceUtil';
const writeLogLock = new AsyncLock({ maxPending: 10000000000 });


@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<Request>();
    const log = new RequestLog(req);
    console.log('NODE REQUEST:', log.url, log.body);
    return next.handle()
      .pipe(
        tap(() => {
          log.useTime = Date.now() - log.time;
          console.log('NODE RESPONSE:', log.url, log.body, 'useTime = ' + log.useTime);
          this.writeLog(log); // 实际调用写入日志
        })
      );

  }

  writeLog(log:RequestLog) {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const logMessage = `[${timestamp}] [REQUEST] ${log.method} ${log.url} - ${log.useTime}ms\n    Body: ${JSON.stringify(log.body)}`;
    writeLogLock.acquire("Lock", () => {
      return appendFile(resourceUtil.logFilePath, logMessage + '\n');
    }).catch(e => {
      console.error('writeLog', e);
    });
  }

}