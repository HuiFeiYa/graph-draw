<script setup lang="ts">
import { Shape, ShapeKey } from '@hfdraw/types';
import { PathBuilder } from '@hfdraw/elbow'
import { ref, reactive, computed, watch } from 'vue';
import { waypointUtil } from '../util/edgeUtil/WaypointUtil';
import { Point } from '@hfdraw/elbow/util/common-type';
import { createEventHandler } from '../util/createEventHandler';
const props = defineProps<{
  shape:Shape
}>();

// 绑定图形的操作，并将 shape 作为参数
const eventHandler = createEventHandler(props, {
  omit: ['mouseover', 'mousemove']
});
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
  
  <g style="cursor: pointer;">
    <path
      :d="computedData.svgPath"
      :stroke="computedData.style.strokeColor"
:stroke-width="computedData.style.strokeWidth"
      fill="none"
    />
    <path
      :d="computedData.svgPath"
      stroke="rgba(0,0,0,0)"
      fill="none"
      stroke-width="4"
      v-on="eventHandler"
    />
  </g>
</template>