import { EventType, Shape } from "@hfdraw/types";
import { GraphModel } from "../main";

export function createEventHandler(graph: GraphModel,props:{shape:Shape}, options?: { omit: string[]}) {
  const eventHandlers = {
    click() {
      console.log('shape: ', props.shape)
      graph.emitter.emit(EventType.SHAPE_CLICK, window.event, props.shape);
    },
   
    mouseover() {
      graph.emitter.emit(EventType.SHAPE_MOUSE_OVER,window.event, props.shape);
    },
    mousedown() {

      graph.emitter.emit(EventType.SHAPE_MOUSE_DOWN, window.event, props.shape);
    },
    mouseup() {

      // debugger;
      graph.emitter.emit(EventType.SHAPE_MOUSE_UP, window.event, props.shape);

    },

    mousemove(event:MouseEvent) {
      graph.emitter.emit(EventType.SHAPE_MOUSE_MOVE, event, props.shape);

    },

    drop() {
      graph.emitter.emit(EventType.SHAPE_DRAG_DROP, window.event, props.shape);
    },

    dragover(event:DragEvent) {

      event.stopPropagation();
      event.preventDefault();
      graph.emitter.emit(EventType.SHAPE_DRAG_OVER, window.event, props.shape);

    },


    dblclick() {
      graph.emitter.emit(EventType.SHAPE_DBL_CLICK, window.event, props.shape);
    }

  };
  if (options?.omit) {
    options.omit.forEach((k) => {
      delete eventHandlers[k as keyof typeof eventHandlers]
    })
  }
  return eventHandlers;
}
