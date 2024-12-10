<script setup >
import { inject, computed } from 'vue'
const props = defineProps();
const graph = inject('graph') ;
const data = computed(() => {
  return {
    children: [],
    edges: []
  }
})
</script>
<template>
  <g @click.stop @mousedown.stop @mouseup.stop @mousemove.stop @dragenter.stop @dragleave.stop @dragover.stop>
    <!-- 网格背景色 -->
    <rect :width="shape.bounds.width" :height="shape.bounds.height" :x="shape.bounds.absX" :y="shape.bounds.absY"
      fill="url(#flow_canvas_grid_item)" style="pointer-events:none">
    </rect>
    <g>
      <component v-for="childShape in data.children" :key="childShape.id"
        :is="graph.getShapeComp(childShape.subShapeType)" :shape="childShape"></component>
    </g>
    <component v-for="edge in data.edges" :key="edge.id" :is="graph.getShapeComp(edge.subShapeType)" :shape="edge">
    </component>
  </g>
</template>

<style scoped></style>