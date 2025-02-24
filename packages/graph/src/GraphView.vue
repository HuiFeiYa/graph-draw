<script setup lang="ts">
import { provide, onMounted, ref, onUnmounted, computed, watch } from "vue";
import Grid from './components/grid.vue'
import DiagramShape from "./DiagramShape.vue";
import { GraphProps } from "./types";
import { emitter } from "./util/Emitter";
import { EventType, Shape, VertexType } from "@hfdraw/types";
import SelectionVertex from './shape/SelectionVertex.vue';
import HoverArrow from './shape/HoverArrow.vue';
import MindMapQuickAdd from './shape/MindMapQuickAdd.vue';
import ShapeMovePreview from "./shape/ShapeMovePreview.vue";
import EdgeMovePreview from './shape/EdgeMovePreview.vue'
const props = defineProps<GraphProps>();
provide("graphProps", props);
provide('graph', props.graph);
const viewDom = ref(null);

// 是否显示选中效果
const showSelectionVertex = computed(() => {
  const { selectionModel } = props.graph;
  return (
    selectionModel.selectedShapes.length > 0
  );
});

const showHoverArrow = computed(() => {
  const { hoverModel } = props.graph;
  return !!hoverModel.hoverShape
})
function handleClickOut() {
  emitter.emit(EventType.SHAPE_CLEAR,window.event,undefined);
 }

function handleMousedownOut() {
  emitter.emit(EventType.SHAPE_MOUSE_DOWN, window.event, undefined);
}
function handleMouseupOut() {
  emitter.emit(EventType.SHAPE_MOUSE_UP, window.event, undefined);
}
function handleMousemove() {
  emitter.emit(EventType.SHAPE_MOUSE_MOVE, event, undefined);
}
function handleDragOver() {
  emitter.emit(EventType.SHAPE_DRAG_OVER, window.event);
}

function handleArrowHover(index: VertexType, shape: Shape) {
  props.graph.graphOption.showPopover(index, shape);
}

const handleDrop = () => { };
onMounted(() => {
  if (!viewDom.value) return;
  props.graph.viewModel.setViewDom(viewDom.value);
});

onUnmounted(() => {
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
      <Grid />
      <DiagramShape v-bind="props" />
    </svg>
    <!-- 交互层 -->
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" transform-origin="0 0"
      style="min-width: 100%; min-height: 100%;position: absolute; top: 0; left: 0; pointer-events: none"
      @click="handleClickOut" @mousedown="handleMousedownOut" @mouseup="handleMouseupOut" @mousemove="handleMousemove"
      @dragover="handleDragOver" @drop.stop="handleDrop">
      <selection-vertex v-if="showSelectionVertex" :selection="graph.selectionModel.selection" />
      <!-- 悬浮箭头 -->
      <hover-arrow v-if="showHoverArrow" :shape="graph.hoverModel.hoverShape as Shape" @arrowHover="handleArrowHover" />
      <shape-move-preview v-if="graph.moveModel.showMovingPreview"  :shapes="graph.moveModel.movingShapes" :dx="graph.moveModel.previewDx" :dy="graph.moveModel.previewDy" />
      <edge-move-preview v-if="graph.edgeMoveModel.showPreview" :preview-path="graph.edgeMoveModel.previewPath" />
      <mind-map-quick-add v-if="graph.mindMapModel.selectShape" :shape="graph.mindMapModel.selectShape" :graph="graph" />
    </svg>
  </div>
</template>
<style>
.graph-view {
  position: relative;
  padding: 12px;
  height: 100%;
}

svg {
  image-rendering: optimizeQuality;
}
</style>
