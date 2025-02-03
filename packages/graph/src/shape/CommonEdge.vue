<script setup lang="ts">
import { Shape } from '@hfdraw/types';
import { PathBuilder } from '@hfdraw/elbow'
import { computed } from 'vue';
import { Point } from '@hfdraw/elbow/util/common-type';
import { createEventHandler } from '../util/createEventHandler';
const props = defineProps<{
  shape: Shape
}>();

// 绑定图形的操作，并将 shape 作为参数
const eventHandler = createEventHandler(props, {
  omit: ['mouseover', 'mousemove']
});
const computedData = computed(() => {
  const shape = props.shape;
  const pathBuilder = new PathBuilder({
    distance: 10,
    size: 10,
    angle: 45
  });
  const keyPoints: Point[] = props.shape.waypoint.map(item => {
    return [item.x, item.y]
  })
  const arrowStyle = shape.style.arrowStyle
  const drawOptions = { hasEndArrow: !!arrowStyle?.hasEnd, hasStartArrow: !!arrowStyle?.hasStart }
  const { pathData, arrowData } = pathBuilder.draw(keyPoints, drawOptions)
  const style = Object.assign({}, shape.style);

  return {
    pathData,
    arrowData,
    style
  };
});
</script>
<template>

  <g style="cursor: pointer;">
    <path :d="computedData.arrowData" :stroke="computedData.style.arrowStyle?.fill || 'black'" :stroke-width="computedData.style.strokeWidth"
      fill="none" />
    <path :d="computedData.pathData" stroke="rgba(21,71,146,0.5)" :stroke-width="computedData.style.strokeWidth"
      fill="none" />
    <path :d="computedData.pathData" stroke="rgba(0,0,0,0)" fill="none" stroke-width="4" v-on="eventHandler" />
  </g>
</template>