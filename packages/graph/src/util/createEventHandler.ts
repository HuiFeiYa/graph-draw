import { EventType, Shape } from "@hfdraw/types";
import { GraphModel } from "../main";
import { emitter } from "./Emitter";

export function createEventHandler(props:{shape:Shape}) {
  return {
    click() {

      emitter.emit(EventType.SHAPE_CLICK, window.event, props.shape);
    },
   
    mouseover() {
      console.log('EventType.SHAPE_MOUSE_OVER:',EventType.SHAPE_MOUSE_OVER)
      emitter.emit(EventType.SHAPE_MOUSE_OVER,window.event, props.shape);
    },
    mousedown() {

      emitter.emit(EventType.SHAPE_MOUSE_DOWN, window.event, props.shape);
    },
    mouseup() {

      // debugger;
      emitter.emit(EventType.SHAPE_MOUSE_UP, window.event, props.shape);

    },

    mousemove(event:MouseEvent) {
      emitter.emit(EventType.SHAPE_MOUSE_MOVE, event, props.shape);

    },

    drop() {
      emitter.emit(EventType.SHAPE_DRAG_DROP, window.event, props.shape);
    },

    dragover(event:DragEvent) {

      event.stopPropagation();
      event.preventDefault();
      emitter.emit(EventType.SHAPE_DRAG_OVER, window.event, props.shape);

    },


    dblclick() {
      emitter.emit(EventType.SHAPE_DBL_CLICK, window.event, props.shape);
    }

  };
}
