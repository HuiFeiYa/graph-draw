// ws.module.ts
import { Module } from '@nestjs/common';
import { WsService } from './WsService';

@Module({
  providers: [WsService],
  exports: [WsService], // 导出 WsService 以便其他模块可以使用它
})
export class WsModule {}