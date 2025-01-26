<script setup lang="ts">
import { Shape, ShapeKey } from '@hfdraw/types';
import { PathBuilder } from '@hfdraw/elbow'
import { ref, reactive, computed, watch } from 'vue';
import { waypointUtil } from '../util/edgeUtil/WaypointUtil';
import { Point } from '@hfdraw/elbow/util/common-type';
const props = defineProps<{
  shape:Shape
}>();
const computedData = computed(() => {
const shape = props.shape;
  // const svgPath = waypointUtil.getSvgPath(props.shape);
  const pathBuilder = new PathBuilder({
        distance: 10,
        size: 10,
        angle: 45
    });
    const keyPoints: Point[] = props.shape.waypoint.map(item => {
      return [item.x, item.y]
    })
   
    const drawOptions = {hasEndArrow: false, hasStartArrow: false}
    if (shape.shapeKey === ShapeKey.Association) {
      drawOptions.hasEndArrow = true;
    }
    const pathData = pathBuilder.draw(keyPoints, drawOptions)
  const style = Object.assign({}, shape.style);

  return {
    svgPath:pathData,
    style
  };
});
</script>
<template>
<path
      :d="computedData.svgPath"
      :stroke="computedData.style.strokeColor"
      :stroke-width="computedData.style.strokeWidth"
      fill="none"
    />
</template>