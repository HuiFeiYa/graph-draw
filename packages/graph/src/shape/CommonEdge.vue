<script setup lang="ts">
import { ElbowPoint, Shape } from '@hfdraw/types';
import { PathBuilder } from '@hfdraw/elbow'
import { computed, inject } from 'vue';
import { createEventHandler } from '../util/createEventHandler';
import { StrokeColor } from '../util/common';
import { GraphModel } from '../models/GraphModel';
const props = defineProps<{
  shape: Shape
}>();

const graph = inject<GraphModel>('graph') as GraphModel ;
const eventHandler = createEventHandler(graph,props, {
  omit: ['mouseover', 'mousemove']
});
// 绑定图形的操作，并将 shape 作为参数
const computedData = computed(() => {
  const shape = props.shape;
  const pathBuilder = new PathBuilder({
    distance: 10,
    size: 10,
    angle: 45
  });
  const keyPoints: ElbowPoint[] = props.shape.waypoint.map(item => {
    return [item.x, item.y]
  })
  const arrowStyle = shape.style.arrowStyle
  const drawOptions = { hasEndArrow: !!arrowStyle?.hasEnd, hasStartArrow: !!arrowStyle?.hasStart }
  const { pathData, endArrow, startArrow } = pathBuilder.draw(keyPoints, drawOptions)
  const style = Object.assign({}, shape.style);

  return {
    pathData,
    startArrow,
    endArrow,
    style
  };
});
</script>
<template>

  <g style="cursor: pointer;">
    <path :d="computedData.startArrow" :stroke="StrokeColor" :stroke-width="computedData.style.strokeWidth"
      :fill="computedData.style.arrowStyle?.fillStart || 'none'" />
    <path :d="computedData.endArrow" :stroke="StrokeColor" :stroke-width="computedData.style.strokeWidth"
      :fill="computedData.style.arrowStyle?.fillEnd || 'none'" />
    <path :d="computedData.pathData" stroke="rgba(21,71,146,0.5)" :stroke-width="computedData.style.strokeWidth"
      fill="none" />
    <path :d="computedData.pathData" stroke="rgba(0,0,0,0)" fill="none" stroke-width="4" v-on="eventHandler" />
  </g>
</template>