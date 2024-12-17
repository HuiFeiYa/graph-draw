<script setup lang="ts">
import { computed } from 'vue'
import { shapeManager } from './shape/index'
import { Graph } from './types/index';
const props = defineProps<{
  graph: Graph,
}>();
const edges = computed(() => {
  return props.graph.edges.filter(childShape => shapeManager[childShape.subShapeType]);
})
const symbols = computed(() => {
  return props.graph.symbols.filter(childShape => shapeManager[childShape.subShapeType]);
})
</script>
<template>
  <g @click.stop @mousedown.stop @mouseup.stop @mousemove.stop @dragenter.stop @dragleave.stop @dragover.stop>
    <g>
      <component v-for="childShape in symbols" :key="childShape.id"
        :is="shapeManager[childShape.subShapeType]" :shape="childShape"></component>
    </g>
    <component v-for="edge in edges" :key="edge.id" :is="shapeManager[edge.subShapeType]" :shape="edge">
    </component>
  </g>
</template>

<style scoped></style>