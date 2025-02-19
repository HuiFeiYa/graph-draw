<script setup lang="ts">
import { Shape } from '@hfdraw/types';
import { ref, computed, onMounted  } from 'vue'
import { createEventHandler } from '../util/createEventHandler';

const props = defineProps<{
  shape: Shape
}>();

// 绑定图形的操作，并将 shape 作为参数
const eventHandler = createEventHandler(props);

const retrospectOption = computed(() => {
//   return props.shape.style.retrospectOption;
return {
    expand: true,
    relationTypes: []
}
});


const style = {}
</script>
<template>
  <g style="cursor: pointer;">
    <rect
      :x="shape.bounds.absX"
      :y="shape.bounds.absY"
      :width="shape.bounds.width"
      :height="shape.bounds.height "
      stroke="rgba(21,71, 146,0.5)"
      :stroke-width="style.strokeWidth"
      fill="url(#blueDiagonalLines)"
      :rx="style.borderRadius||0"
      :ry="style.borderRadius||0"
      :stroke-dasharray="style.strokeDasharray || ''"
       v-on="eventHandler"
    />
          <!-- 展开收起 icon -->
    <template>
      <!-- 展开 -->
      <image
        v-if="retrospectOption.expand && shape.modelId"
        href="/statics/graph/treeiconspread.svg"
        :x="shape.bounds.absX + shape.bounds.width"
        :y="isChangeAnalyseMap ? shape.bounds.absY + 12 : shape.bounds.absY + 3"
        @click="shrinkShape" />
      <!-- 收缩 -->
      <image
        v-if="!retrospectOption.expand && shape.modelId"
        href="/statics/graph/treeiconshrink.svg"
        :x="shape.bounds.absX + shape.bounds.width"
        :y="isChangeAnalyseMap ? shape.bounds.absY + 12 : shape.bounds.absY + 3"
        @click="expandShape" />
    </template>
  </g>
</template>
<style scoped>
</style>