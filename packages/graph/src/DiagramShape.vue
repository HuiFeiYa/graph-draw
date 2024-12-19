<script setup lang="ts">
import { computed } from 'vue'
import { shapeCompManager } from './shape/index'
import { Graph } from './types/index';
const props = defineProps<{
  graph: Graph,
}>();
const edges = computed(() => {
  return props.graph.edges.filter(childShape => shapeCompManager.get(childShape.subShapeType));
})
const symbols = computed(() => {
  return props.graph.symbols.filter(childShape => shapeCompManager.get(childShape.subShapeType));
})
</script>
<template>
  <g @click.stop @mousedown.stop @mouseup.stop @mousemove.stop @dragenter.stop @dragleave.stop @dragover.stop>
    <g>
      <component v-for="childShape in symbols" :key="childShape.id"
        :is="shapeCompManager.get(childShape.subShapeType)" :shape="childShape"></component>
    </g>
    <component v-for="edge in edges" :key="edge.id" :is="shapeCompManager.get(edge.subShapeType)" :shape="edge">
    </component>
  </g>
</template>

<style scoped></style>