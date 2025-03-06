<script setup lang="ts">
import { EventType, Shape } from '@hfdraw/types';
import { ref, computed, onMounted  } from 'vue'
import { createEventHandler } from '../util/createEventHandler';
import { emitter } from '../util/Emitter';

const props = defineProps<{
  shape: Shape
}>();

// 绑定图形的操作，并将 shape 作为参数
const eventHandler = createEventHandler(props, {omit: ['mouseover', 'dragover']});

const retrospectOption = computed(() => {
//   return props.shape.style.retrospectOption;
return {
    expand: true,
    relationTypes: []
}
});

const style = computed(() => {
  const shape = props.shape;

  return Object.assign({}, shape.style);
});

function handleShrinkShape(){
  
}
function handleExpandShape(){
  
}

function handleNameLabelClick(event: MouseEvent) {
  emitter.emit(EventType.NAME_LABEL_CLICK, event, props.shape);
}
</script>
<template>
  <g style="cursor: pointer;">
    <rect
      :x="shape.bounds.absX"
      :y="shape.bounds.absY"
      :width="shape.bounds.width"
      :height="shape.bounds.height "
      :stroke="style.stroke"
      :stroke-width="style.strokeWidth"
      fill="#fff"
      :rx="style.borderRadius||0"
      :ry="style.borderRadius||0"
       v-on="eventHandler"
       @click="handleNameLabelClick"
    />
          <!-- 展开收起 icon -->
    <template>
      <!-- 展开 -->
      <image
        v-if="retrospectOption.expand && shape.modelId"
        href="/statics/graph/treeiconspread.svg"
        :x="shape.bounds.absX + shape.bounds.width"
        :y=" shape.bounds.absY + 3"
        @click="handleShrinkShape" />
      <!-- 收缩 -->
      <image
        v-if="!retrospectOption.expand && shape.modelId"
        href="/statics/graph/treeiconshrink.svg"
        :x="shape.bounds.absX + shape.bounds.width"
        :y=" shape.bounds.absY + 3"
        @click="handleExpandShape" />
    </template>

    <!-- 文本 -->

    <foreignObject :x="shape.nameBounds.absX" :y="shape.nameBounds.absY" :width="shape.nameBounds.width" :height="shape.nameBounds.height">
      <div style="pointer-events:auto;line-height: 1.5;" :style="{fontSize: shape.style.fontSize+'px'}"  @click="handleNameLabelClick" >
        {{ shape.modelName }}
      </div>
    </foreignObject>
  </g>
</template>
<style scoped>
</style>