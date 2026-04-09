import { onMounted, onBeforeUnmount } from "vue";
// import { emitter } from "./Emitter";
import { GraphModel } from "../models/GraphModel";
/**
 * 通用的监听全局事件
 * 会在mounted时监听，onBeforeUnmount时卸载监听
 * @param graph
 * @param events
 */
export const useEvents = (graph: GraphModel, events:Record<string, Function>) => {
  onMounted(() => {
    graph.emitter.onBatch(events);
  });
  onBeforeUnmount(() => {
    graph.emitter.offBatch(events);

  });
};