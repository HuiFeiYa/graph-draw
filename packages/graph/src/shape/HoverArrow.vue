<script setup lang="ts">
import { Shape } from '@hfdraw/types';
import { ref, reactive, computed, watch } from 'vue';
import { VertexType } from '../util/common';
const props = defineProps<{
  shape:Shape
}>();
const bounds = computed(() => {
    return props.shape.bounds;
})
// 箭头线部分长
const lineLength = 27;
// 箭头的宽度
const arrowWidth = 8;
// 箭头的高度
const arrowHeight = 16;

const leftPoint = computed(()=> {
    const { x,y, width, height} = bounds.value;
    return {
        x,
        y: y+ height/2
    }
})

const topPoint = computed(()=> {
    const { x,y, width, height} = bounds.value;
    return {
        x: x + width/2,
        y
    }
})

const rightPoint = computed(() => {
    const { x,y, width, height} = bounds.value;
    return {
        x: x + width,
        y: y+ height/2
    }
})
const bottomPoint = computed(() => {
    const { x,y, width, height} = bounds.value;
    return {
        x: x + width/2,
        y: y+ height
    }
})

const leftArrow = computed(() => {
    const {x,y} = leftPoint.value;
    const vertexX = x - arrowWidth - lineLength;
    const vertexY = y;
    return {
        // 从箭头顶点开始画
        points: `${vertexX},${vertexY} ${vertexX + arrowWidth},${vertexY - arrowHeight / 2} ${vertexX + arrowWidth},${vertexY + arrowHeight / 2}`,
        x1: vertexX + arrowWidth,
        y1: vertexY,
        x2: vertexX + arrowWidth + lineLength,
        y2: vertexY,
    }
})
function handleMouseDown(event: MouseEvent, index: VertexType) {
    event.stopPropagation();
    //   emit('vertex-mousedown', event, index);
}
</script>
<template>
<g style="transform: translate(12px,12px);">
            <!-- 左侧 -->
            <g>
                <polygon  :points="leftArrow.points" fill="rgba(0, 0, 255, 0.5)" />
                <line :x1="leftArrow.x1" :y1="leftArrow.y1" :x2="leftArrow.x2" :y2="leftArrow.y2" stroke-width="6" stroke="rgba(0, 0, 255, 0.5)"/>
            </g>
</g>
</template>