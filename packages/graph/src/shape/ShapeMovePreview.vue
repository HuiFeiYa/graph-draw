<script setup lang="ts">
import { Shape, ShapeType } from '@hfdraw/types';
import { GraphProps } from '../types/index'
import { inject, ref, reactive, computed, watch } from 'vue';
import { PathBuilder } from '../util/PathBuilder'
import { shapeSkeletonUtil } from '../models/ShapeSkeletonUtil'
/**
 * 图形单个移动或批量移动时的预览组件
 */
 const props = defineProps<{shapes: Shape[], dx: number, dy:number}>();

 const graphProps = inject<GraphProps>('graphProps')
  const c = new PathBuilder();
 const typeChild = computed(() => {
  const ret: {
    symbols: Shape[]
    edges: Shape[]
  } = {
    symbols: [],
    edges: [],
  };
  props.shapes.forEach(shape => {
    switch (shape.shapeType) {
      case ShapeType.Edge:
        ret.edges.push(shape);
        break;

      default:
        ret.symbols.push(shape);
        break;
    }
  });
  return ret;
})

const symbolBoundsSvgPath = computed(() => {
  if (typeChild.value.symbols.length > 0) {
    c.clear();
    typeChild.value.symbols.forEach(shape => {
      const drawFn = shapeSkeletonUtil.getRectPath;
      drawFn(c, shape);
    });
    console.log(c.getPath());
    return c.getPath();

  } else {
    return '';
  }
});

  console.log("typeChild.value.edges:",typeChild.value.edges)
const edgePaths = computed(() => {
  // 返回每条线的 path 字符串
  return typeChild.value.edges.map(edge => {
    if (edge.waypoint && edge.waypoint.length > 1) {
      const c = new PathBuilder();
      c.MoveTo(edge.waypoint[0].x, edge.waypoint[0].y);
      for (let i = 1; i < edge.waypoint.length; i++) {
        c.LineTo(edge.waypoint[i].x, edge.waypoint[i].y);
      }
      return c.getPath();
    }
    return '';
  });
});
</script>
<template>
  <!-- 移动图形预览 -->
<g :transform="`translate(${dx},${dy})`">
    <path
      v-if="typeChild.symbols.length>0"
      :d="symbolBoundsSvgPath"
      fill="none"
      stroke-width="2"
      :stroke="typeChild.symbols[0].style.strokeColor"
    />
    <path
      v-for="(d, idx) in edgePaths"
      :key="idx"
      :d="d"
      fill="none"
      stroke-width="2"
      :stroke="typeChild.edges[0].style.strokeColor"
    />
</g>
</template>