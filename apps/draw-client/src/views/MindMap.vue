<script setup lang="ts">
import { reactive, onMounted  } from 'vue'
import { GraphView, GraphModel } from "@hfdraw/graph";
import {  Change, Shape, SubShapeType } from "@hfdraw/types";
import { BusEvent } from "../constants/config";
import { GraphOption } from '../editor/graphOption';
import { emitter } from "../util/Emitter";
import {  StType } from "@hfdraw/types";
import { shapeService } from "../util/ShapeService";
import { SideBarDropDto } from '../types/shape.dto';
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

async function  createRect() {
  const params:SideBarDropDto = {
    diagramId: '1',
    point: {x: 100, y: 100},
    projectId: 'p2',
    modelId: StType['SysML::MindMap']
  }
  const res = await shapeService.sidebarDrop(params)
}

async function fretchData() {
  await shapeService.getAllShapes('p2').then(data => {
    // console.log('data: ', data)
    if (data.length > 0) {
      graphData.graph.symbols = data;
      data.forEach(shape => {
        graphData.graph.addShape(shape)
      })
    } else {
      createRect()
    }
  })
}
onMounted(async ()=> {
  fretchData();
})


const events = {
  [BusEvent.INSERT_SHAPE]: (change: Change) => {
    if (change.newValue) {
      const shape = JSON.parse(change.newValue);
      graphData.graph.symbols.push(shape)
      graphData.graph.addShape(shape)
    }

  },
  [BusEvent.DELETE_SHAPE]: (change: Change) => {
    graphData.graph.symbols = graphData.graph.symbols.filter(s => s.id_ !== change.shapeId)
  },
  [BusEvent.UPDATE_SHAPE]: async (change: Change) => {
    // console.log('update:', change)
    const newValue = JSON.parse(change.newValue || '')
    const i = graphData.graph.symbols.findIndex(s => s.id_ === change.shapeId);
    if (i !== -1) {
      // graphData.graph.symbols.splice(i, 1, shape)
      Object.assign(graphData.graph.symbols[i],{...newValue})
    }
  }
}

// 监听事件
emitter.onBatch(events)
</script>
<template>
  <div class='mindMap-container'>
    <GraphView v-bind="graphData" style="flex:1" />
  </div>
</template>
<style scoped>
.mindMap-container {
  height: 100%;
}
</style>