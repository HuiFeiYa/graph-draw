<script setup lang="ts">
import { reactive, onMounted  } from 'vue'
import { GraphView, GraphModel } from "@hfdraw/graph";
import {  Change, Shape } from "@hfdraw/types";
import { BusEvent } from "../constants/config";
import { GraphOption } from '../editor/graphOption';
import {  StType } from "@hfdraw/types";
import { shapeService } from "../util/ShapeService";
import { SideBarDropDto } from '../types/shape.dto';
import { useProjectStore } from '../stores/project';
import { useRoute } from 'vue-router';
import { useEvents } from '../util/useEvents';
const projectStore = useProjectStore();
const graphOption = new GraphOption(projectStore.projectId);
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
    projectId: projectStore.projectId,
    stType: StType['SysML::MindMap']
  }
  const res = await shapeService.sidebarDrop(params)
}

async function fetchData() {
  await shapeService.getAllShapes(projectStore.projectId).then(data => {
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
  const route = useRoute();
  const projectId = route.query.projectId as string;
  console.log('projectId: ', projectId,route.query);
  if (projectId) {
    projectStore.setCurrentProjectId(projectId);
  }
  fetchData();
})


const events = {
  [BusEvent.INSERT_SHAPE]: (change: Change) => {
    if (change.newValue) {
      const shape =change.newValue as Shape;
      graphData.graph.symbols.push(shape)
      graphData.graph.addShape(shape)
    }
  },
  [BusEvent.DELETE_SHAPE]: (change: Change) => {
    graphData.graph.symbols = graphData.graph.symbols.filter(s => s.id_ !== change.objectId)
  },
  [BusEvent.UPDATE_SHAPE]: async (change: Change) => {
    // console.log('update:', change)
    const newValue = change.newValue || '' as Partial<Shape>
    const i = graphData.graph.symbols.findIndex(s => s.id_ === change.objectId);
    if (i !== -1) {
      // graphData.graph.symbols.splice(i, 1, shape)
      Object.assign(graphData.graph.symbols[i], {...newValue})
    }
  }
}

// 监听事件
useEvents(events)
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