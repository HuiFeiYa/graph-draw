import { ChangeType,  Step,  StepMessageData, StepType } from "@hfdraw/types";
import { BusEvent, ConnectStatus } from "../constants/config";
import { emitter } from "../util/Emitter";
import { stepStatusReactive } from "../util/StepStatus";
import { shapeService } from "../util/ShapeService";
import { useProjectStore } from "../stores/project";
class SocketOption {
  /**
   * 最大尝试重连次数
   */
  maxReconnectTime = 3;
  /**
   * socket连接uri ，如 ws://127.0.0.1:8080/websocket
   */
  uri = '';
  //   msgHandler: { [p: string]: (res: any) => void };
}
export class SocketService {
  ws: WebSocket | undefined = undefined;
  reconnectTime = 0;
  status: ConnectStatus = ConnectStatus.UNCONNECT;
  uri: string;
  maxReconnectTime = 3;
  
  msgHandler: {[key:string]:Function} = {
    connect:() => {
      const store = useProjectStore();
      this.sendJSON({ type: "subscribeProject", projectId: store.projectId });
    },
    async step(messageData:{ type:'step', data: Step}) {
      const { data: { changes, stepType, projectId } } = messageData;
      const isUndo = stepType === StepType.undo;
      const isEdit = stepType === StepType.edit;
      changes.forEach(change => {
        if (change.type === ChangeType.INSERT) {
          if (isUndo) {
            emitter.emit(BusEvent.DELETE_SHAPE, change)

          } else {
            emitter.emit(BusEvent.INSERT_SHAPE, change);
          }
        } else if (change.type === ChangeType.DELETE) {

          if (isUndo) {
           
            emitter.emit(BusEvent.INSERT_SHAPE, {...change, oldValue: change.newValue, newValue: change.oldValue})

          } else {
            emitter.emit(BusEvent.DELETE_SHAPE, change)
          }
        } else if (change.type === ChangeType.UPDATE) {
          if (isUndo) {
            const oldValue = change.newValue;
            const newValue = change.oldValue;
            emitter.emit(BusEvent.UPDATE_SHAPE, {...change,oldValue, newValue});
          } else {
            emitter.emit(BusEvent.UPDATE_SHAPE, change);
          }
        }
      })
      /**
       * 需要每次都更新 step 状态，例如:
       * 1. 添加图形
       * 2. 移动图形，
       * 3. undo，此时 redo 应该可以点击
       * 4. 添加图形，此时 redo 应该不可以点击
       */
      await stepStatusReactive.fresh(projectId)
    }
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

  onMessage(e: MessageEvent<string>) {
    const res = JSON.parse(e.data) as { type: string; data: StepMessageData};
    console.log('res:',res)
    res.type
    if (this.msgHandler[res.type]) {
      this.msgHandler[res.type](res);
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


const socketOption: SocketOption = {
  uri: 'ws://localhost:3005',
  maxReconnectTime: 3,
};

export const socketService = new SocketService(socketOption);
socketService.start();