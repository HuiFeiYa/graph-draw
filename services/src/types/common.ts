import { LogLevel } from "@nestjs/common";
import { ShapeEntity } from "src/entities/shape.entity";

export enum WsMessageType {
    step = 'step'
  }

  export enum RequireMapPosition {
    vertical = "vertical", // 纵向
    horizontal = "horizontal" // 横向
  }

  export type ShapeMap = Map<string, ShapeEntity>

  export class LogData {
    message: string;
    level?: LogLevel;
    stack?: string;
    constructor(message: string, level?: LogLevel, stack?: string) {
      this.message = message;
      this.level = level;
      this.stack = stack;
    }
  }