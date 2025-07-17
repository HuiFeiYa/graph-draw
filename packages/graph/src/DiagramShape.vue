<script setup lang="ts">
import { computed } from 'vue'
import { shapeCompManager } from './shape/index'
import { GraphProps } from './types';
const props = defineProps<GraphProps>();
  const symbols = computed(() => {
  return props.graph.symbols.sort((a, b) => a.zIndex - b.zIndex).filter(childShape => shapeCompManager.get(childShape.subShapeType));
})


</script>
<template>
  <g @click.stop @mousedown.stop @mouseup.stop @mousemove.stop @dragenter.stop @dragleave.stop @dragover.stop>
    <g>
      <component v-for="childShape in symbols" :key="childShape.id"
        :is="shapeCompManager.get(childShape.subShapeType)" :shape="childShape" :graph="graph"></component>
    </g>
  </g>
</template>

<style scoped></style>