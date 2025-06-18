<template>
  <div style="display: flex; flex-direction: column; height: 100%">
    <div style="display: flex; flex: 1">
      <Siderbar />
      <GraphView v-bind="graphData" style="flex: 1"></GraphView>
    </div>
    <Footer 
      :scale="graphData.graph.graphOption.scale" 
      @zoom-in="handleZoomIn" 
      @zoom-out="handleZoomOut" 
      @scale-change="handleScaleChange"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { GraphView, GraphModel } from "@hfdraw/graph";
import { Change, Shape, StyleObject, SubShapeType } from "@hfdraw/types";
import Siderbar from "../editor/components/SiderBar.vue";
import Footer from "../components/Footer.vue";
import { BusEvent } from "../constants/config";
import { useEvents } from "../util/useEvents";
import { shapeService } from "../util/ShapeService";
import { GraphOption } from "../editor/graphOption";
import { HeaderDropdownEnum, StrokeColor } from "../types/enum";
import { useProjectStore } from '../stores/project';
import { useRoute } from 'vue-router';
import { socketService } from "../socket/SocketService";
const projectStore = useProjectStore();
const route = useRoute();
const projectId = route.query.projectId as string;
console.log('projectId: ', projectId)
const graphOption = new GraphOption(projectId);

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
      const shape = change.newValue as Shape;
      graphData.graph.symbols.push(shape)
      graphData.graph.addShape(shape)
    }

  },
  [BusEvent.DELETE_SHAPE]: (change: Change) => {
    graphData.graph.symbols = graphData.graph.symbols.filter(s => s.id_ !== change.objectId)
  },
  [BusEvent.UPDATE_SHAPE]: async (change: Change) => {
    // console.log('update:', change)
    const newValue = change.newValue 
    const i = graphData.graph.symbols.findIndex(s => s.id_ === change.objectId);
    if (i !== -1) {
      // graphData.graph.symbols.splice(i, 1, shape)
      Object.assign(graphData.graph.symbols[i],{...newValue})
    }
  },
  [BusEvent.CLEAR_STATUS]: async (change: Change) => {
    graphData.graph.clear();
  },
  [BusEvent.REFRESH]: async ()=> {
    await fretchData()
  },
  [BusEvent.DROPDOWN_ITEM_CLICK]: async (item: {value: HeaderDropdownEnum}) => {
    const edgeShape = graphData.graph.selectionModel.selectedShapes.find(s => s.subShapeType === SubShapeType.CommonEdge);
    if (!edgeShape) return 
    const newStyleObj: StyleObject = {

    }
    const originArrowStyle = edgeShape.style.arrowStyle || {}
    switch(item.value) {
      case HeaderDropdownEnum.leftLine: {
        newStyleObj.arrowStyle = {
          ...originArrowStyle,
          hasStart : false,
          fillStart: 'none'
        }
        break;
      }
      case HeaderDropdownEnum.leftSolidArrow: {
        newStyleObj.arrowStyle = {
          ...originArrowStyle,
          hasStart : true,
          fillStart: StrokeColor
        }
        break;
      }
      case HeaderDropdownEnum.lefthollowArrow: {
        newStyleObj.arrowStyle = {
          ...originArrowStyle,
          hasStart : true,
          fillStart: 'none'
        }
        break;
      }
      case HeaderDropdownEnum.rightLine: {
        newStyleObj.arrowStyle = {
          ...originArrowStyle,
          hasEnd : false,
          fillEnd: 'none'
        }
        break;
      }
      case HeaderDropdownEnum.rightSolidArrow: {
        newStyleObj.arrowStyle = {
          ...originArrowStyle,
          hasEnd : true,
          fillEnd: StrokeColor
        }
        break;
      }
      case HeaderDropdownEnum.righthollowArrow: {
        newStyleObj.arrowStyle = {
          ...originArrowStyle,
          hasEnd : true,
          fillEnd: 'none'
        }
        break;
      }
    }
    await shapeService.updateShapeStyle({styleObject: newStyleObj, projectId: 'p1', shapeId: edgeShape.id});
  }
};
async function fretchData() {
  await shapeService.getAllShapes(projectStore.projectId).then(data => {
    // console.log('data: ', data)
    if (data) {
      graphData.graph.symbols = data;
      data.forEach(shape => {
        graphData.graph.addShape(shape)
      })
    }
  })
}
// 缩放控制函数
function handleZoomIn() {
  graphData.graph.graphOption.zoomIn();
}

function handleZoomOut() {
  graphData.graph.graphOption.zoomOut();
}

function handleScaleChange(scale: number) {
  graphData.graph.graphOption.setScale(scale);
}

// 监听事件
useEvents(events)

onMounted(()=> {
  
  console.log('projectId----: ', projectId,route.query);
  if (projectId) {
    projectStore.setCurrentProjectId(projectId);
    socketService.sendJSON({ type: 'subscribeProject', projectId });
  }
  fretchData()
})
</script>
