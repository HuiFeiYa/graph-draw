import { Server } from 'ws';
import { Injectable, OnModuleInit, OnApplicationShutdown } from '@nestjs/common';
import { IncomingMessage } from 'node:http';
import { WsClient } from 'src/modules/socket/WsClient';
import { WsMessageType } from 'src/types/common';
import { Step, StepMessageData } from '@hfdraw/types';
import { loggerUtils } from '../../utils/LoggerUtils';

export class WsService {
  private wsServer: Server;
  private clients: WsClient[] = [];
  private port = 3005;
  id=''

  constructor() {
    loggerUtils.logToFile({ message: 'init wsService' });
    this.id = Math.random().toString(36).substr(2, 9);
    this.init();
  }

  init() {
    // 创建 WebSocket 服务器
    this.wsServer = new Server({ port: this.port });
    this.wsServer.addListener('connection', this.onConnection.bind(this));
  }

  onApplicationShutdown(signal?: string) {
    // 关闭 WebSocket 服务器
    this.wsServer.close();
  }

  removeClient(wsC: WsClient) {
    loggerUtils.logToFile({ message: 'removeClient--------' });
    const index = this.clients.indexOf(wsC);
    if (index !== -1) {
      this.clients.splice(index, 1);
    }
  }

  onConnection(client: WebSocket, request: IncomingMessage) {
    const { url, headers: { origin } } = request;
    const searchParams = new URL(origin + url).searchParams;
    const wsClient = new WsClient(client, this, searchParams);
    this.addClient(wsClient);
    wsClient.sendJSON({ type: 'connect', data: 'connectSuccess' });
  }

  addClient(wsC: WsClient) {
    this.clients.push(wsC);
  }
  sendToSubscribedClient(projectId: string, data: {
    type: WsMessageType
    data: Step
  }) {
    const str = JSON.stringify(data);
    for (let client of this.clients) {
      if (client.subscribeProjectIds.has(projectId)) { // 向有过订阅的socket推送变化
        try {
          client.sendStr(str);

        } catch (err: any) {
          console.error(err);

        }
      }
    }
  }
}

export const wsService = new WsService();