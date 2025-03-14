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
import LabelEditor from './shape/LabelEditor.vue'
const props = defineProps<GraphProps>();
provide("graphProps", props);
provide('graph', props.graph);
const viewDom = ref(null);
// 拖拽状态
const isDragging = ref(false);
const startPos = ref({ x: 0, y: 0 });
const transform = ref({ x: 0, y: 0 });
const scale = ref(1);

// 获取 DOM 元素
const rootGroup = ref(null);
const svgElement = ref<SVGSVGElement|null>(null);
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

function handleMousedownOut(event:MouseEvent) {
  emitter.emit(EventType.SHAPE_MOUSE_DOWN, window.event, undefined);
  handleMousedown(event);
}
function handleMouseupOut(event:MouseEvent) {
  emitter.emit(EventType.SHAPE_MOUSE_UP, window.event, undefined);
  isDragging.value = false;
}
function handleMousemove(event:MouseEvent) {
  emitter.emit(EventType.SHAPE_MOUSE_MOVE, event, undefined);
  handleMousemoveSvg(event);
}
function handleDragOver(event:MouseEvent) {
  emitter.emit(EventType.SHAPE_DRAG_OVER, event);
}

function handleArrowHover(index: VertexType, shape: Shape) {
  props.graph.graphOption.showPopover(index, shape);
}

const handleDrop = () => { };

const handleLabelInput = (text: string, rect: {clientX: number; clientY: number}, shape?: Shape) => {
  props.graph.labelEditorModel.changeTextValue(text);
}
const handleLabelBlur = () => {
  props.graph.labelEditorModel.labelEditorBlur();
}

// 鼠标按下事件
function handleMousedown(event: MouseEvent) {
  if (!svgElement.value) return;
  isDragging.value = true;
  const CTM = svgElement.value.getScreenCTM();
  if (!CTM) return ;
  startPos.value = {
    x: (event.clientX - CTM.e) / CTM.a,
    y: (event.clientY - CTM.f) / CTM.d,
  };
}

// 鼠标移动事件
function handleMousemoveSvg(event:MouseEvent) {
  if (!isDragging.value) return;
  if (!svgElement.value) return;
  const CTM = svgElement.value.getScreenCTM();
  if (!CTM) return ;
  const dx = (event.clientX - startPos.value.x * CTM.a - CTM.e) / CTM.a;
  const dy = (event.clientY - startPos.value.y * CTM.d - CTM.f) / CTM.d;

  transform.value.x += dx;
  transform.value.y += dy;

  startPos.value = {
    x: (event.clientX - CTM.e) / CTM.a,
    y: (event.clientY - CTM.f) / CTM.d,
  };
}

function handleWheel(event:WheelEvent) {
  if (!svgElement.value) return;
  event.preventDefault();

  const CTM = svgElement.value.getScreenCTM();
  if (!CTM) return ;
  const delta = event.deltaY < 0 ? 1.02 : 0.98;
  scale.value *= delta;
}

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
    <svg version="1.1" ref="svgElement" xmlns="http://www.w3.org/2000/svg" transform-origin="0 0"
      style="min-width: 100%; min-height: 100%;background-color: white;cursor:move" @click="handleClickOut"
      @mousedown="handleMousedownOut" @mouseup="handleMouseupOut" @mousemove="handleMousemove"
      @dragover="handleDragOver" @drop.stop="handleDrop"
       @mouseleave="handleMouseupOut" @wheel="handleWheel">
      <Grid />
      <g ref="rootGroup"
      :transform="`matrix(${scale}, 0, 0, ${scale}, ${transform.x}, ${transform.y})`">
        <DiagramShape v-bind="props" />
      </g>
    </svg>
    <!-- 交互层 -->
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" transform-origin="0 0"
      style="min-width: 100%; min-height: 100%;position: absolute; top: 12px; left: 12px; pointer-events: none;shape-rendering: geometricPrecision;"
      @click="handleClickOut" @mousedown="handleMousedownOut" @mouseup="handleMouseupOut" @mousemove="handleMousemove"
      @dragover="handleDragOver" @drop.stop="handleDrop">
      <g :transform="`matrix(${scale}, 0, 0, ${scale}, ${transform.x}, ${transform.y})`">
        <selection-vertex v-if="showSelectionVertex" :selection="graph.selectionModel.selection" />
        <!-- 悬浮箭头 -->
        <hover-arrow v-if="showHoverArrow" :shape="graph.hoverModel.hoverShape as Shape" @arrowHover="handleArrowHover" />
        <shape-move-preview v-if="graph.moveModel.showMovingPreview"  :shapes="graph.moveModel.movingShapes" :dx="graph.moveModel.previewDx" :dy="graph.moveModel.previewDy" />
        <edge-move-preview v-if="graph.edgeMoveModel.showPreview" :preview-path="graph.edgeMoveModel.previewPath" />
        <mind-map-quick-add v-if="graph.mindMapModel.selectShape" :shape="graph.mindMapModel.selectShape" :graph="graph" />
        <label-editor v-if="graph.labelEditorModel.showPreview" :editor-model="graph.labelEditorModel" @input="handleLabelInput" @blur="handleLabelBlur" />
      </g>
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
