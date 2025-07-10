<script setup lang="ts">
import { provide, onMounted, ref, onUnmounted, computed, watch } from "vue";
import Grid from './components/grid.vue'
import DiagramShape from "./DiagramShape.vue";
import { GraphProps } from "./types";
import { EdgeShape, EventType, Shape, ShapeType, VertexType } from "@hfdraw/types";
import SelectionVertex from './shape/SelectionVertex.vue';
import HoverArrow from './shape/HoverArrow.vue';
import MindMapQuickAdd from './shape/MindMapQuickAdd.vue';
import ShapeMovePreview from "./shape/ShapeMovePreview.vue";
import EdgeMovePreview from './shape/EdgeMovePreview.vue'
import LabelEditor from './shape/LabelEditor.vue'
import ShapeResizePreview from './shape/ShapeResizePreview.vue';
const props = defineProps<GraphProps>();
provide("graphProps", props);
provide('graph', props.graph);
const viewDom = ref(null);
// 拖拽状态
const isDragging = ref(false);
const startPos = ref({ x: 0, y: 0 });
const transform = ref({ x: 0, y: 0 });

// 获取 DOM 元素
const rootGroup = ref(null);
const dom0 = ref<HTMLSpanElement|null>(null);
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
  props.graph.emitter.emit(EventType.SHAPE_CLEAR,window.event,undefined);
 }

function handleMousedownOut(event:MouseEvent) {
 props.graph.emitter.emit(EventType.MOUSE_DOWN_OUT, window.event, undefined);
  handleMousedown(event);
}
function handleMouseupOut(event:MouseEvent) {
 props.graph.emitter.emit(EventType.SHAPE_MOUSE_UP, window.event, undefined);
  isDragging.value = false;
}
function handleMousemove(event:MouseEvent) {
 props.graph.emitter.emit(EventType.SHAPE_MOUSE_MOVE, event, undefined);
  /**
   * if (思维脑图) {
   * handleMousemoveSvg(event);
   * }
   */
}
function handleDragOver(event:MouseEvent) {
 props.graph.emitter.emit(EventType.SHAPE_DRAG_OVER, event);
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
  props.graph.graphOption.handleWheel(event);
}

function handleVertexMousedown(event: MouseEvent, index: number) {
  const { graph } = props;
  if (graph.selectionModel.selection.length === 0) return;
  if (graph.selectionModel.selection.length > 1) {
    graph.selectionModel.clearSelection();
  } else {
    const targetShape = graph.selectionModel.selection[0];

    if (targetShape.shapeType === ShapeType.Edge) {
      const isEndPoint = index === 0 || index === targetShape.waypoint.length;
      // 如果是起点或者终点
      if (isEndPoint) {
        graph.edgeMoveModel.onEdgeStartOrEndPointMousedown(event, targetShape as unknown as EdgeShape, index === 0 ? 0 : 1);
      } else {
        // 如果是中间点，走线段移动逻辑
        graph.edgeMoveModel.onEdgeSegmentMousedown(event, targetShape as unknown as EdgeShape, index);
      }
    }  else {
      graph.resizeModel.startResize(event, graph.selectionModel.selection[0], index);
    }
  }
}

function handleCaptureMouseEvent(event:MouseEvent) {
  if ((event.detail as any).fromGraphView) return;

  let custom = new CustomEvent(event.type, { detail: { fromGraphView: true }, bubbles: true });
  (custom as any).shiftKey = event.shiftKey;
  (custom as any).clientX = event.clientX;
  (custom as any).clientY = event.clientY;

  dom0.value?.dispatchEvent(custom);
}

onMounted(() => {
  if (!viewDom.value) return;
  props.graph.viewModel.setViewDom(viewDom.value);
});

onUnmounted(() => {
})

</script>
<template>
  <div class="graph-view" ref="viewDom" 
  @mouseup.capture="handleCaptureMouseEvent"
  @mousedown.capture="handleCaptureMouseEvent">
    <!-- 
          展示层
          * 整个画布的事件监听
        -->
    <svg version="1.1" ref="svgElement" xmlns="http://www.w3.org/2000/svg" transform-origin="0 0"
      style="min-width: 100%; min-height: 100%;background-color: white;" @click="handleClickOut"
      @mousedown="handleMousedownOut" @mouseup="handleMouseupOut" @mousemove="handleMousemove"
      @dragover="handleDragOver" @drop.stop="handleDrop"
        @wheel="handleWheel">
      <Grid />
      <g ref="rootGroup"
      :transform="`matrix(${props.graph.graphOption.scale}, 0, 0, ${props.graph.graphOption.scale}, ${transform.x}, ${transform.y})`">
        <DiagramShape v-bind="props" />
      </g>
    </svg>
    <!-- 交互层 -->
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" transform-origin="0 0"
      style="min-width: 100%; min-height: 100%;position: absolute; top: 12px; left: 12px; pointer-events: none;shape-rendering: geometricPrecision;"
      @click="handleClickOut" @mousedown="handleMousedownOut" @mouseup="handleMouseupOut" @mousemove="handleMousemove"
      @dragover="handleDragOver" @drop.stop="handleDrop">
      <g :transform="`matrix(${props.graph.graphOption.scale}, 0, 0, ${props.graph.graphOption.scale}, ${transform.x}, ${transform.y})`">
        <!-- 拉伸图形预览 -->
        <shape-resize-preview v-if="graph.resizeModel.showResizePreview" :bounds="graph.resizeModel.previewBounds" :color="graph.resizeModel.resizeShape?.style.strokeColor||'black'" /> 
         <!-- 图形拉伸控制点 -->
        <selection-vertex v-if="showSelectionVertex" :selection="graph.selectionModel.selection" @vertex-mousedown="handleVertexMousedown"/>
        <!-- 悬浮箭头 -->
        <hover-arrow v-if="showHoverArrow" :shape="graph.hoverModel.hoverShape as Shape" @arrowHover="handleArrowHover" />
        <!-- 图形移动预览 -->
        <shape-move-preview v-if="graph.moveModel.showMovingPreview"  :shapes="graph.moveModel.movingShapes" :dx="graph.moveModel.previewDx" :dy="graph.moveModel.previewDy" />
        <!-- 线移动预览 -->
        <edge-move-preview v-if="graph.edgeMoveModel.showPreview" :preview-path="graph.edgeMoveModel.previewPath" />
        <!-- 快速添加图形辅助箭头 -->
        <mind-map-quick-add v-if="graph.mindMapModel.selectShape" :shape="graph.mindMapModel.selectShape" :graph="graph" />
      </g>
    </svg>
    <span ref="dom0"></span>
  </div>
</template>
<style lang="scss">
.graph-view {
  position: relative;
  padding: 12px;
  height: 100%;
}

svg {
  image-rendering: optimizeQuality;
}
</style>
