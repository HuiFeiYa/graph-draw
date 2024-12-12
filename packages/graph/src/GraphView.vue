<script setup>
import { provide, computed, onMounted, ref, onUnmounted } from "vue";
import DiagramShape from "./DiagramShape.vue";
import { shapeComps } from "./shape/index";
import {
  ShapeType, EventType,
  showQuickCreateList,
} from '@hfdraw/types'
import { resizeUtil } from "./util/resizeUtil";
const props = defineProps();
provide("graph", props.graph);
// props.graph.registerShapeComps(shapeComps);
const viewDom = ref(null);
/** 快速创建 edge ，的重点，用于 shapeDashboard 定位 */
const quickCreateEdgeShape = ref(null)
/** 快速创建线的方向 */
const edgeIndex = ref();

//store 中是最新的样式， model 中存储的是历史的，@todo，如何同步？
const selectedShapes = computed(() => {
  return []
});

const borderRadius = computed(() => {
  return selectedShapes.value[0]?.style.borderRadius || 0
})
const showSelectionVertex = computed(() => {
  return (
    selectedShapes.value.length > 0 &&
    !props.graph.moveModel.showMovingPreview &&
    !props.graph.resizeModel.showResizePreview &&
    !props.graph.edgePointMoveModel.showPreview
  );
});

const edgeEndPoint = computed(() => {
  if (quickCreateEdgeShape) {
    const waypoint = quickCreateEdgeShape.value.waypoint
    return waypoint[waypoint.length - 1]
  } else {
    return {
      x: 0,
      y: 0
    }
  }
})
const showQuickCreatePoint = computed(() => {

  if (
    selectedShapes.value.length === 1 &&
    showQuickCreateList.includes(selectedShapes.value[0].subShapeType)
  ) {
    return true;
  }
  return false;
});

function handleVertexMousedown(event, index) {
  const graph = props.graph;
  if (graph.selectionModel.selection.length === 0) return;
  if (graph.selectionModel.selection.length > 1) {
    graph.selectionModel.clearSelection();
  } else {
    const targetShape = selectedShapes.value[0];
    if (targetShape.shapeType === ShapeType.Symbol) {
      graph.resizeModel.startResize(event, selectedShapes.value[0], index);
    } else if (targetShape.shapeType === ShapeType.Edge) {
      graph.edgePointMoveModel.onEdgePointMouseDown(event, targetShape, index);
    }
  }
}
function handleClickOut() { }
// 监听画布上点击事件，用于清空选中状态
function handleMousedownOut(event) {
  props.graph.emitter.emit(EventType.SHAPE_MOUSE_DOWN, event, undefined);
}
function handleMouseupOut() {
  props.graph.emitter.emit(
    EventType.SHAPE_MOUSE_UP,
    window.event,
    props.graph.rootShape
  );
}
function handleMousemove(event) {
}
function handleDragOver() { }

const handleDrop = () => { };
const handleTriggerDashboard = (val) => {
  props.graph.isShowShapeDashboard = val
}
/** 快速创建线 */
const handleQuickCreate = async (index) => {
  const edgeShape = await props.graph.quickCreateEdge(
    selectedShapes.value[0],
    index
  );
  edgeIndex.value = index;
  resizeUtil.expandParent(edgeShape)
  quickCreateEdgeShape.value = edgeShape
  // 弹框，选择继续要创建的元素
  handleTriggerDashboard(true)
};

/** 快速创建指定图形 */
const handleCreateShape = async (siderBarkey) => {
  const edge = quickCreateEdgeShape.value
  const waypoint = edge.waypoint
  const shape = await props.graph.quickCreateSymbol(
    siderBarkey,
    waypoint[waypoint.length - 1],
    edgeIndex.value,
    edge
  );
  edgeIndex.value = "";
  resizeUtil.expandParent(shape)
  quickCreateEdgeShape.value = null;
  handleTriggerDashboard(false)
};
const trigger = () => handleTriggerDashboard(false)
onMounted(() => {
  if (!viewDom.value) return;
  // props.graph.viewModel.setViewDom(viewDom.value);
  // window.addEventListener('click', trigger)
});

onUnmounted(() => {
  window.removeEventListener('click', trigger)
})
</script>
<template>
  <div class="graph-view" ref="viewDom">
    <!-- 
          展示层
          * 整个画布的事件监听
        -->
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" transform-origin="0 0"
      style="min-width: 100%; min-height: 100%;background-color: white;" @click="handleClickOut"
      @mousedown="handleMousedownOut" @mouseup="handleMouseupOut" @mousemove="handleMousemove"
      @dragover="handleDragOver" @drop.stop="handleDrop">
      <g style="width: 100%; height: 100%; background-color: white">
        <defs>
          <pattern id="flow_canvas_grid_item" width="61" height="61" patternUnits="userSpaceOnUse">
            <path id="flow_canvas_grid_path1" stroke-width="1" fill="none"
              d="M0 15L60 15M15 0L15 60M0 30L60 30M30 0L30 60M0 45L60 45M45 0L45 60" stroke="rgb(242,242,242)"></path>
            <path id="flow_canvas_grid_path2" stroke-width="1" fill="none" d="M0 60L60 60M60 0L60 60"
              stroke="rgb(229,229,229)"></path>
          </pattern>
          <pattern xmlns="http://www.w3.org/2000/svg" patternUnits="userSpaceOnUse" id="flow_canvas_watermark_item"
            width="300" height="300">
            <text x="150" y="100" font-size="18" transform="rotate(-45, 150, 150)"
              style="dominant-baseline: middle; text-anchor: middle;"></text>
          </pattern>
        </defs>
        <!-- 网格背景色 -->
        <rect width="100%" height="100%" :x="0" :y="0"
          fill="url(#flow_canvas_grid_item)" style="pointer-events:none">
        </rect>
        <!-- <DiagramShape :graph="graph" :shape="graph.rootShape" /> -->
      </g>
    </svg>
  </div>
</template>
<style>
.graph-view {
  position: relative;
  padding: 12px;
}

svg {
  image-rendering: optimizeQuality;
}
</style>
