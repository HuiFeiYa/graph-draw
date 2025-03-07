<script setup lang="ts">
import { computed } from 'vue'
import { shapeCompManager } from './shape/index'
import { GraphProps } from './types';
import { Shape, ShapeKey, SubShapeType } from '@hfdraw/types';
const props = defineProps<GraphProps>();
  const symbols = computed(() => {
  // console.log('props: ',props)
  return props.graph.symbols.filter(childShape => shapeCompManager.get(childShape.subShapeType));
})

const edges = computed(() => {
  const ret: Shape[] = props.graph.edges.filter(childShape => shapeCompManager.get(childShape.subShapeType));
  props.graph.symbols.forEach(symbol => {
    if (symbol.shapeKey === ShapeKey.MindMapShape) {
      const newSymbol = { ...symbol, subShapeType: SubShapeType.MindMapLine };
      ret.push(newSymbol);
    }
  })
  return ret;
})

</script>
<template>
  <g @click.stop @mousedown.stop @mouseup.stop @mousemove.stop @dragenter.stop @dragleave.stop @dragover.stop>
    <g>
      <component v-for="childShape in symbols" :key="childShape.id"
        :is="shapeCompManager.get(childShape.subShapeType)" :shape="childShape" :graph="graph"></component>
    </g>
    <component v-for="edge in edges" :key="edge.id" :is="shapeCompManager.get(edge.subShapeType)" :shape="edge" :graph="graph">
    </component>
  </g>
</template>

<style scoped></style>