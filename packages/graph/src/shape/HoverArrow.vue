<script setup lang="ts">
import { Shape } from '@hfdraw/types';
import { ref, reactive, computed, watch } from 'vue';
import { VertexType } from '../util/common';
const props = defineProps<{
  shape:Shape
}>();
const emit = defineEmits<{
    (e: 'arrowHover', index: VertexType, shape: Shape): void
}>()
const bounds = computed(() => {
    return props.shape.bounds;
})
const activeArrowIndex = ref(-1);
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

const topArrow = computed(()=> {
    const {x,y} = topPoint.value;
    const vertexX = x;
    const vertexY = y - lineLength - arrowWidth;
    return {
        // 从箭头顶点开始画
        points: `${vertexX},${vertexY} ${vertexX - arrowHeight/2},${vertexY +arrowWidth} ${vertexX + arrowHeight/2},${vertexY +arrowWidth}`,
        x1: vertexX,
        y1: vertexY +arrowWidth,
        x2: vertexX,
        y2: y,
    }
})

const rightArrow = computed(() => {
    const {x,y} = rightPoint.value;
    const vertexX = x + arrowWidth + lineLength;
    const vertexY = y;
    return {
        // 从箭头顶点开始画
        points: `${vertexX},${vertexY} ${vertexX - arrowWidth},${vertexY - arrowHeight / 2} ${vertexX - arrowWidth},${vertexY + arrowHeight / 2}`,
        x1: vertexX - arrowWidth,
        y1: vertexY,
        x2: vertexX - arrowWidth - lineLength,
        y2: vertexY,
    }
})
const bottomArrow = computed(()=> {
    const {x,y} = bottomPoint.value;
    const vertexX = x;
    const vertexY = y + lineLength + arrowWidth;
    return {
        // 从箭头顶点开始画
        points: `${vertexX},${vertexY} ${vertexX - arrowHeight/2},${vertexY - arrowWidth} ${vertexX + arrowHeight/2},${vertexY - arrowWidth}`,
        x1: vertexX,
        y1: vertexY - arrowWidth,
        x2: vertexX,
        y2: y,
    }
})

const leftArrowColor = computed(()=> {
    return getColor(VertexType.left)
})
const rightArrowColor = computed(()=> {
    return getColor(VertexType.right)
})
const topArrowColor = computed(()=> {
    return getColor(VertexType.top)
})
const bottomArrowColor = computed(()=> {
    return getColor(VertexType.bottom)
})
function handleMouseEnter (index: VertexType) {
    activeArrowIndex.value = index;
    emit('arrowHover',index, props.shape);
}
function handleMouseout () {
    activeArrowIndex.value = -1;
}
function handleMouseDown(event: MouseEvent, index: VertexType) {
    event.stopPropagation();
    //   emit('vertex-mousedown', event, index);
}
function getColor(vertexType: VertexType) {
    return activeArrowIndex.value === vertexType ? 'rgba(0, 0, 255, 0.8)': 'rgba(0, 0, 255, 0.2)';
}

</script>
<template>
    <!-- 这里需要设置 points-events 为auto才能捕获事件，在 svg 根元素上设置了 none -->
<g style="transform: translate(12px,12px);pointer-events: auto;">
            <!-- 左侧 -->
            <g @mouseenter="handleMouseEnter(VertexType.left)" @mouseout="handleMouseout" :fill="leftArrowColor" :stroke="leftArrowColor">
                <polygon  :points="leftArrow.points"  />
                <line :x1="leftArrow.x1" :y1="leftArrow.y1" :x2="leftArrow.x2" :y2="leftArrow.y2" stroke-width="6" />
            </g>
            <!-- 上侧 -->
            <g @mouseenter="handleMouseEnter(VertexType.top)" @mouseout="handleMouseout" :fill="topArrowColor" :stroke="topArrowColor">
                <polygon  :points="topArrow.points"  />
                <line :x1="topArrow.x1" :y1="topArrow.y1" :x2="topArrow.x2" :y2="topArrow.y2" stroke-width="6"/>
            </g>
            <!-- 右侧 -->
            <g @mouseenter="handleMouseEnter(VertexType.right)" @mouseout="handleMouseout" :fill="rightArrowColor" :stroke="rightArrowColor">
                <polygon  :points="rightArrow.points" />
                <line :x1="rightArrow.x1" :y1="rightArrow.y1" :x2="rightArrow.x2" :y2="rightArrow.y2" stroke-width="6"/>
            </g>
            <!-- 下侧 -->
            <g @mouseenter="handleMouseEnter(VertexType.bottom)" @mouseout="handleMouseout" :fill="bottomArrowColor" :stroke="bottomArrowColor">
                <polygon  :points="bottomArrow.points" />
                <line :x1="bottomArrow.x1" :y1="bottomArrow.y1" :x2="bottomArrow.x2" :y2="bottomArrow.y2" stroke-width="6"/>
            </g>
</g>
</template>