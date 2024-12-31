<script setup lang="ts">
import { Shape } from '@hfdraw/types';
import { ref, reactive, computed, watch } from 'vue';
import { waypointUtil } from '../util/edgeUtil/WaypointUtil';
const props = defineProps<{
  shape:Shape
}>();
const computedData = computed(() => {
const shape = props.shape;
  const svgPath = waypointUtil.getSvgPath(props.shape);
  const style = Object.assign({}, shape.style);
  shape.svgPath = svgPath;
  return {
    svgPath,
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
      stroke-linejoin="round"
    />
</template>