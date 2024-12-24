<template>
  <div style="display: flex; height: 100%">
    <Siderbar />
    <GraphView v-bind="graphData" style="flex: 1"></GraphView>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { GraphView, GraphModel } from "@hfdraw/graph";
import { Change, Shape } from "@hfdraw/types";
import Siderbar from "../editor/components/SiderBar.vue";
import { BusEvent } from "../constants/config";
import { emitter } from "../util/Emitter";
import { shapeService } from "../util/ShapeService";
import { GraphOption } from "../editor/graphOption";
const graphOption = new GraphOption('p1');
const graphData = reactive<{
  edges: Shape[],
  symbols: Shape[],
  graph: GraphModel
}>({
  edges:[],
  symbols: [],
  graph: new GraphModel(graphOption)
});
const events = {
  [BusEvent.INSERT_SHAPE]: (change: Change) => {
    if (change.newValue) {
      const shape = JSON.parse(change.newValue);
      graphData.symbols.push(shape)
    }

  },
  [BusEvent.DELETE_SHAPE]: (change: Change) => {
    graphData.symbols = graphData.symbols.filter(s => s.id_ === change.shapeId)
  },
  [BusEvent.UPDATE_SHAPE]: async (change: Change) => {
    console.log('update:', change)
    const newValue = JSON.parse(change.newValue || '')
    const i = graphData.symbols.findIndex(s => s.id_ === change.shapeId);
    if (i !== -1) {
      // graphData.symbols.splice(i, 1, shape)
      Object.assign(graphData.symbols[i],{...newValue})
    }
  },
};
// 监听事件
emitter.onBatch(events)

onMounted(()=> {
  shapeService.getAllShapes('p1').then(data => {
    console.log('data: ', data)
    if (data) {
      graphData.symbols.push(...data)
    }
  })
})
</script>
