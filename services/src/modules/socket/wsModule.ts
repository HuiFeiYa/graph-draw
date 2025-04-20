// ws.module.ts
import { Module } from '@nestjs/common';
import { WsService } from './WsService';

@Module({
  providers: [WsService],
  exports: [WsService]
})
export class WsModule {}