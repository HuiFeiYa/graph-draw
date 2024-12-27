<script setup lang="ts">
import { provide, onMounted, ref, onUnmounted, computed } from "vue";
import Grid from './components/grid.vue'
import DiagramShape from "./DiagramShape.vue";
import { GraphProps } from "./types";
import { emitter } from "./util/Emitter";
import { EventType, Shape, VertexType } from "@hfdraw/types";
import SelectionVertex from './shape/SelectionVertex.vue';
//@ts-ignore
import HoverArrow from './shape/HoverArrow.vue';
const props = defineProps<GraphProps>();
provide("graphProps", props);
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
function handleClickOut() { }

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
      <hover-arrow v-if="showHoverArrow" :shape="graph.hoverModel.hoverShape as Shape" @arrowHover="handleArrowHover" />
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
