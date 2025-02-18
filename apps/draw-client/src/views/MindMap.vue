<script setup lang="ts">
import { reactive } from 'vue'
import { GraphView, GraphModel } from "@hfdraw/graph";
import {  Shape } from "@hfdraw/types";
import { GraphOption } from '../editor/graphOption';
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
</script>
<template>
  <div class='mindMap-container'>
    123
    <GraphView v-bind="graphData" style="flex:1" />
  </div>
</template>
<style scoped>
</style>