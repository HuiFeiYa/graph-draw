import { ChangeType, StepMessageData, StepType } from "@hfdraw/types/socket";
import { ConnectStatus } from "../constants/config";
import { emitter } from "../util/Emitter";
class SocketOption {
  /**
   * 最大尝试重连次数
   */
  maxReconnectTime = 3;
  /**
   * socket连接uri ，如 ws://127.0.0.1:8080/websocket
   */
  uri: string;
  //   msgHandler: { [p: string]: (res: any) => void };
}
export class SocketService {
  ws: WebSocket | undefined = undefined;
  reconnectTime = 0;
  status: ConnectStatus = ConnectStatus.UNCONNECT;
  uri: string;
  maxReconnectTime = 3;
  msgHandler = {
    connect() {
      this.sendJSON({ type: "subcribeProject", projectIds: 1 });
    },
    step(messageData:StepMessageData) {
      const { projectId, step,  affectShapes, stepType } = messageData;
      const isUndo = stepType === StepType.undo;
      step.changes.forEach(change => {
        if (change.type === ChangeType.INSERT) {
          if (isUndo) {
            // this.doDeleteShape(shape);

          } else {
            // this.doInsertShape(shape);

          }
        } else if (change.type === ChangeType.DELETE) {

          if (isUndo) {
            // this.doInsertShape(shape);

          } else {
            // this.doDeleteShape(shape);

          }
        } else if (change.type === ChangeType.UPDATE) {
          // this.doUpdateShape(shape);
        }
      })
      // const { projectId, step, isUndo, affectModels } = res.data as {projectId:string, step:Step, isUndo:boolean, affectModels:{id_:number, id:string, ownerId:string, type:ModelType}[] };
    },
  };
  constructor(option: SocketOption) {
    const { uri, maxReconnectTime } = option;
    this.uri = uri;
    this.maxReconnectTime = maxReconnectTime;
  }
  start() {
    if (this.ws) {
      try {
        this.ws?.close();
      } catch (error) {
        console.error(error);
      }
    }
    this.ws = new WebSocket(this.uri + "?clientId=0");
    this.ws.onopen = this.onOpen.bind(this);
    this.ws.onmessage = this.onMessage.bind(this);
    this.ws.onclose = this.onClose.bind(this);
    this.ws.onerror = this.onError.bind(this);
  }
  onOpen() {
    this.status = ConnectStatus.CONNECTED;
    this.reconnectTime = 0;
  }

  onMessage(e: MessageEvent) {
    const res = JSON.parse(e.data);
    if (this.msgHandler[res.type]) {
      this.msgHandler[res.type].call(this, res);
    } else {
      console.error("[消息格式错误] unKnow msg type:" + res.type, res);
    }
  }
  onClose() {
    // 主动关闭，由于后端关闭都会触发此处的onClose
    if (this.status === ConnectStatus.CLOSED) {
      return;
    }
  }
  onError(e: Event) {
    console.error(e);
  }

  sendJSON(obj: any) {
    this.ws?.send(JSON.stringify(obj));
  }
}
