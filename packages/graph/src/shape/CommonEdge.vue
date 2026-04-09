<script setup lang="ts">
import { ElbowPoint, Shape } from '@hfdraw/types';
import { PathBuilder } from '@hfdraw/elbow'
import { computed, inject } from 'vue';
import { createEventHandler } from '../util/createEventHandler';
import { GraphModel } from '../models/GraphModel';
const props = defineProps<{
  shape: Shape
}>();

const graph = inject<GraphModel>('graph') as GraphModel ;
const eventHandler = createEventHandler(graph,props, {
  omit: ['mouseover', 'mousemove']
});

const getEdgeSize = (strokeWidth: number) => {
  // 通用规则：基准为 strokeWidth=2 时为10，其他线宽按比例缩放
  const baseWidth = 2;
  const baseSize = 10;
  const ratio = strokeWidth / baseWidth;
  const size = baseSize * ratio;
  return size;
};

const computedData = computed(() => {
  const shape = props.shape;
  const strokeWidth = shape.style.strokeWidth || 2;
  const size = getEdgeSize(strokeWidth);
  const pathBuilder = new PathBuilder({
    distance: size,
    size,
    angle: 45
  });
  const keyPoints: ElbowPoint[] = props.shape.waypoint.map(item => {
    return [item.x, item.y]
  })
  const arrowStyle = shape.style.arrowStyle
  const drawOptions = { hasEndArrow: !!arrowStyle?.hasEnd, hasStartArrow: !!arrowStyle?.hasStart }
  const { pathData, endArrow, startArrow } = pathBuilder.draw(keyPoints, drawOptions)
  // @ts-ignore
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
    <path :d="computedData.startArrow" :stroke="computedData.style.strokeColor" :stroke-width="computedData.style.strokeWidth"
      :fill="computedData.style.arrowStyle?.fillStart || 'none'" />
    <path :d="computedData.endArrow" :stroke="computedData.style.strokeColor" :stroke-width="computedData.style.strokeWidth"
      :fill="computedData.style.arrowStyle?.fillEnd || 'none'" />
    <path :d="computedData.pathData" :stroke="computedData.style.strokeColor" :stroke-width="computedData.style.strokeWidth"
      fill="none" :stroke-dasharray="computedData.style.strokeDasharray" />
    <path :d="computedData.pathData" stroke="rgba(0,0,0,0)" fill="none" stroke-width="8" v-on="eventHandler" />
  </g>
</template>