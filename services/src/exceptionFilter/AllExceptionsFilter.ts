import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {

  catch(exception: any, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
    
    // 记录详细错误信息
    console.error(`Exception caught at ${request.url}:`, {
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
      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
        message: exception.message || 'Internal server error'
      });
    } else {
      console.warn('Response headers already sent, cannot send error response');
    }
  }
}