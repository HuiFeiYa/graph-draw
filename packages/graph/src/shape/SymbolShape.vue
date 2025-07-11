<template>
  <g
    @click.stop
    @mousedown.stop
    @mouseup.stop
    @mousemove.stop
    @dragenter.stop
    @dragleave.stop
    @drop.stop
    @dragover.stop
    style="cursor: pointer;"
     v-on="eventHandler"
      @dblclick="handleStartEdit"
      @mouseover="handleMouseOver"
  @mouseleave="handleMouseLeave"
  >
  <defs>
    <pattern id="blueDiagonalLines" patternUnits="userSpaceOnUse" width="8" height="8">
      <line x1="8" y1="0" x2="0" y2="8" style="stroke:rgba(21,71, 146,0.3); stroke-width:0.5"/>
    </pattern>
  </defs>

<rect
  :x="shape.bounds.absX"
  :y="shape.bounds.absY"
  :width="shape.bounds.width"
  :height="shape.bounds.height"
  :stroke="style.strokeColor"
  :stroke-width="style.strokeWidth"
  :fill="highlight ?  getLighterColor(style.background) : style.background"
  :rx="style.borderRadius||0"
  :ry="style.borderRadius||0"
  :stroke-dasharray="style.strokeDasharray || ''"
  
/>
  
  <EditableLabel
    ref="editableLabelRef"
    :bounds="shape.bounds"
    :name-bounds="shape.nameBounds"
    :label="shape.modelName || ''"
    :font-size="14"
    @end-edit="handleEndEdit"
  />

    <!-- 选中时渲染粒子动画 -->
    <template v-if="graph.selectionModel.selectedShapes.includes(props.shape)">
      <EdgeParticle
        v-for="edge in outgoingEdges"
        :key="edge.id"
        :waypoint="edge.waypoint"
      />
    </template>
</g>
</template>
<script lang="ts" setup>
import { Shape, ShapeType } from '@hfdraw/types';
import { computed, inject, ref } from 'vue';
import { createEventHandler } from '../util/createEventHandler';
import { GraphModel } from '../models/GraphModel';
import EditableLabel from '../components/EditableLabel.vue';
import EdgeParticle from './EdgeParticle.vue';
import { getLighterColor } from '@hfdraw/utils';

const props = defineProps<{
  shape: Shape
}>();


const graph = inject<GraphModel>('graph') as GraphModel;
const eventHandler = createEventHandler(graph, props);
const editableLabelRef = ref<InstanceType<typeof EditableLabel>>();
const isHovered = ref(false);

const highlight = computed(() => {
  return isHovered.value && graph.edgeMoveModel.showPreview
});
const handleMouseOver = () => {
  console.log('handleMouseOver');
  isHovered.value = true;
};
const handleMouseLeave = () => {
  isHovered.value = false;
};
const handleStartEdit = () => {
  editableLabelRef.value?.startEdit();
};

const handleEndEdit = (newText: string) => {
  graph.graphOption.saveText(props.shape, newText);
};

const style = computed(() => {
  const shape = props.shape;
  return Object.assign({}, shape.style);
});

// 选中时查找所有满足条件的 edge
const outgoingEdges = computed(() => {
  const edges = graph.symbols.filter(s => s.shapeType === ShapeType.Edge);
  return edges.filter(edge =>
    edge.sourceId === props.shape.id && !!edge.targetId && edge.waypoint && edge.waypoint.length > 1
  );
});
</script>
<style lang="scss">
// foreignObject内部div的通用样式
.tagged-values-container {
  display: flex;
  .tagged-values-box {
    display: flex;
    flex-direction: column;
    .tagged-values-rich-text-container {
      em {
      font-style:italic;
      margin-left: 12px;
      }
    ol >li{
      list-style:decimal;
      margin-left: 12px;
    }
    ul >li{
      list-style-type: disc;
    }
      display: flex;
      .tagged-values-rich-text-box{
        display: flex;
        flex-direction: column;
        .tagged-values-rich-text-content {
          display: flex;
        }
      }
    }

  }
  .semicolon {
    position: relative;
    white-space: pre;
    display: flex;
    span.bottom {
      align-self: flex-end;
    }
  }
}

.show-underline {
  text-decoration: underline;
}

// EditableLabel组件的样式已移至组件内部
</style>