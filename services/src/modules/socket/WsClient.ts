import { WsService } from 'src/modules/socket/WsService';
const messageCallbacks = {
  subscribeProject(client:WsClient, data:{projectId:string, projectIds:string[]}) {
    if (data.projectId) client.subscribeProjectIds.add(data.projectId);
  }
}
export class WsClient {
    clientId: string
    subscribeProjectIds: Set<string> = new Set()
    constructor(public websocket: WebSocket, public socketService: WsService, public searchParams: URLSearchParams) {
        // 监听来自客户端的消息
        this.websocket.addEventListener('message', this.onMessage.bind(this));
        this.websocket.addEventListener('close', this.onClose.bind(this));
    
        this.websocket.addEventListener('error', this.onError.bind(this));
    
      }

      onMessage(messageEvent: MessageEvent) {
        // console.log(messageEvent);
        const data = JSON.parse(messageEvent.data);
        console.log('received message', data);
        const callback = messageCallbacks[data.type];
        if (!callback) {
          console.error('message type not found');
        } else {
          callback(this, data as any);
        }
      }
      onClose(closeEvent: CloseEvent) {
        console.log('websocket onClose');
        this.socketService.removeClient(this);
    
      }
    
      sendJSON(obj: any) {
        this.websocket.send(JSON.stringify(obj));
      }
      onError(e: Event) {
        console.log('websocket error');
        this.socketService.removeClient(this);
      }
      sendStr(str: string) {
        this.websocket.send(str);
    
      }
}


