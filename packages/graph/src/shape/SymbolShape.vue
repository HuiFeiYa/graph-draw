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
      @dblclick="startEdit"
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
      :height="shape.bounds.height "
      stroke="rgba(21,71, 146,0.5)"
      :stroke-width="style.strokeWidth"
      fill="#fff"
      :rx="style.borderRadius||0"
      :ry="style.borderRadius||0"
      :stroke-dasharray="style.strokeDasharray || ''"
      
    >
  </rect>
  <foreignObject
      :width="shape.bounds.width"
      :height="shape.bounds.height"
      :x="shape.bounds.absX"
      :y="shape.bounds.absY"
      style="overflow: visible;"
    >
    <div 
      ref="labelRef"
      class="v-label" 
      :style="{
        width: shape.nameBounds.width + 'px',
        height: shape.nameBounds.height + 'px', 
        left: shape.nameBounds.x + 'px',
        top: shape.nameBounds.y + 'px',
        fontSize: '14px',
        fontFamily: 'inherit',
        lineHeight: 'normal',
        pointerEvents: 'all',
        padding: '0',
        margin: '0',
      }" 
     
      @blur="endEdit"
      @keydown.enter="endEdit"
    >
      {{ shape.modelName }}
    </div>
  </foreignObject>
</g>
</template>
<script lang="ts" setup>
import { Shape } from '@hfdraw/types';
import { computed, inject, ref, nextTick } from 'vue';
import { createEventHandler } from '../util/createEventHandler';
import { GraphModel } from '../models/GraphModel';
const props = defineProps<{
  shape:Shape
}>();
const graph = inject<GraphModel>('graph') as GraphModel ;
const eventHandler = createEventHandler(graph,props);
const labelRef = ref<HTMLDivElement>();

const startEdit = () => {
  if (labelRef.value) {
    labelRef.value.contentEditable = 'true';
    nextTick(() =>{
      if (!labelRef.value) {
        return;
      }
      labelRef.value.focus();
      // 选中所有文案
      const range = document.createRange();
      range.selectNodeContents(labelRef.value);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    })
  }
};



const endEdit = () => {
  if (labelRef.value) {
    labelRef.value.contentEditable = 'false';
    graph.graphOption.saveText(props.shape, labelRef.value.innerText)
  }
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

.v-label {
  position: absolute;
  pointer-events: all;
  border: none;
  outline: none;
  display: block;
  resize: none;
  pointer-events: none;
  font-size: 14px;
  height: 100%;
  &:focus-visible {
      outline: none;

  }
  overflow: visible;

}
</style>