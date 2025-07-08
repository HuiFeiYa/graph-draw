import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { loggerUtils } from '../utils/LoggerUtils';
import { LogData } from '../types/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {

  catch(exception: any, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
    
    // 构建详细的错误日志信息
    const errorDetails = {
      timestamp: new Date().toISOString(),
      method: request.method,
      url: request.url,
      status: status,
      message: exception.message,
      stack: exception.stack,
      body: request.body,
      query: request.query,
      params: request.params,
      headers: request.headers,
      ip: request.ip,
      userAgent: request.get('User-Agent')
    };
    
    // 记录详细错误信息到文件
    loggerUtils.logToFile(new LogData(
      `异常捕获 - ${request.method} ${request.url} (状态码: ${status}): ${exception.message}`,
      'error',
      JSON.stringify(errorDetails, null, 2)
    ));
    
    // 同时输出到控制台
    console.error(`[AllExceptionsFilter] Exception caught at ${request.url}:`, {
      message: exception.message,
      stack: exception.stack,
      timestamp: new Date().toISOString(),
      method: request.method,
      body: request.body,
      query: request.query,
      params: request.params
    });
    
    // 确保响应被正确发送
    if (!response.headersSent) {
      const errorResponse = {
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
        message: exception.message || 'Internal server error'
      };
      
      response.status(status).json(errorResponse);
      
      // 记录响应发送成功
      loggerUtils.logToFile(new LogData(
        `错误响应已发送 - ${request.method} ${request.url} (状态码: ${status})`,
        'log'
      ));
    } else {
      const warningMsg = 'Response headers already sent, cannot send error response';
      console.warn(warningMsg);
      loggerUtils.logToFile(new LogData(warningMsg, 'warn'));
    }
  }
}