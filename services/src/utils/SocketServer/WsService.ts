import { Server } from 'ws';
import { WsClient } from './WsClient';
import { IncomingMessage } from 'node:http';

/**
 * 消息通知服务
 */
const port = 3005;
export class WsService {
  wsServer: Server;
  clients: WsClient[] = [];
  constructor() {
    // 创建 WebSocket 服务器
    this.wsServer = new Server({ port: port });
    /**
     * 当你创建一个新的 WebSocket.Server 实例并监听一个特定的端口时，
     * 这个服务器可以接受多个客户端的连接请求。
     * 每当有一个新的客户端成功建立 WebSocket 连接时，
     * 服务器会为这个连接生成一个新的 WebSocket 实例（即 ws 对象），
     * 并且触发 connection 事件。
     */
    this.wsServer.addListener("connection", this.onConnection.bind(this));
  }
  removeClient(wsC: WsClient) {
    this.clients.splice(this.clients.indexOf(wsC), 1);
  }
  /**
   * 
   * @param client WebSocket 实例，它代表了与特定客户端的连接, 通过这个 ws 对象，你可以发送消息给客户端、接收来自客户端的消息以及处理连接关闭等事件。
   * @param request 
   */
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
}
