<template>
  <div style="display: flex; height: 100%">
    <Siderbar />
    <GraphView :graph="graph" style="flex: 1"></GraphView>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { GraphView } from "@hfdraw/graph";
import { Change, Shape } from "@hfdraw/types";
import Siderbar from "../editor/components/SiderBar.vue";
import { BusEvent } from "../constants/config";
import { emitter } from "../util/Emitter";
const graph = ref<{
  edges: Shape[],
  symbols: Shape[]
}>({
  edges:[],
  symbols: [],
});
const events = {
  [BusEvent.INSERT_SHAPE]: (change: Change) => {
    if (change.newValue) {
      const shape = JSON.parse(change.newValue);
      graph.value.symbols.push(shape)
    }

  },
  [BusEvent.DELETE_SHAPE]: (change: Change) => {},
  [BusEvent.UPDATE_SHAPE]: async (change: Change) => {},
};
// 监听事件
emitter.onBatch(events)
</script>
