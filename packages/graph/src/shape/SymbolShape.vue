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
      @mouseover="isHovered = true"
  @mouseleave="isHovered = false"
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
  stroke="rgba(21,71, 146,0.5)"
  :stroke-width="style.strokeWidth"
  :fill="highlight ? 'rgba(21, 71, 146, 0.08)' : '#fff'"
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
</g>
</template>
<script lang="ts" setup>
import { Shape } from '@hfdraw/types';
import { computed, inject, ref } from 'vue';
import { createEventHandler } from '../util/createEventHandler';
import { GraphModel } from '../models/GraphModel';
import EditableLabel from '../components/EditableLabel.vue';

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