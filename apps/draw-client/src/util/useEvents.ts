import { onBeforeUnmount, onMounted } from "vue";
import { emitter } from "./Emitter";
/**
 * 通用的监听全局事件
 * 会在mounted时监听，onBeforeUnmount时卸载监听
 * @param events
 */
export const useEvents = (events:Record<string, Function>) => {
  onMounted(() => {
    emitter.onBatch(events);
  });
  onBeforeUnmount(() => {
    emitter.offBatch(events);

  });
};