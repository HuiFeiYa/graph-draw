<script setup lang="ts">
import { EventType, Shape } from '@hfdraw/types';
import { ref, reactive, computed, watch, inject } from 'vue';
import { VertexType } from '../util/common';
import { TIP_GAP } from '../util/constant';
import { GraphModel } from '../models/GraphModel';
const props = defineProps<{
    shape: Shape,
    graph: GraphModel
}>();
const emit = defineEmits<{
    (e: 'add', index: VertexType, shape: Shape): void
}>()
const activeArrowIndex = ref(-1);
const bounds = computed(() => {
    return props.shape.bounds;
})

const leftArrowColor = computed(() => {
    return getColor(VertexType.left)
})
const rightArrowColor = computed(() => {
    return getColor(VertexType.right)
})
const topArrowColor = computed(() => {
    return getColor(VertexType.top)
})
const bottomArrowColor = computed(() => {
    return getColor(VertexType.bottom)
})
function getColor(vertexType: VertexType) {
    return activeArrowIndex.value === vertexType ? 'blue' : '#fff';
}

const rightPoint = computed(() => {
    const { absX, absY, width, height } = bounds.value;
    return {
        x: absX + width + TIP_GAP,
        y: absY + height / 2
    }
})
const bottomPoint = computed(() => {
    const { absX, absY, width, height } = bounds.value;
    return {
        x: absX + width / 2,
        y: absY + height + TIP_GAP
    }
})
const topPoint = computed(() => {
    const { absX, absY, width, height } = bounds.value;
    return {
        x: absX + width / 2,
        y: absY - TIP_GAP
    }
})
const leftPoint = computed(() => {
    const { absX, absY, width, height } = bounds.value;
    return {
        x: absX - TIP_GAP,
        y: absY + height / 2
    }
})
const handleAdd = (index: VertexType, shape: Shape) => {
    props.graph.graphOption.addMindMapRect(index, shape);
}
</script>
<template>
    <!-- 这里需要设置 points-events 为auto才能捕获事件，在 svg 根元素上设置了 none -->
    <g  style="transform: translate(12px,12px);pointer-events: auto; cursor: pointer;"
        class='mind-map-quick-add-container'>
        <defs>
            <g id="add-icon">
                <!-- <circle r="6" stroke="blue" /> -->
                <!-- 绘制圆 -->
                <circle cx="0" cy="0" r="10" stroke="gray" stroke-width="1" />
                <!-- 绘制十字 -->
                <!-- 水平线 -->
                <line x1="-6" y1="0" x2="6" y2="0" stroke="#6c6cbd" stroke-width="2" />
                <!-- 垂直线 -->
                <line x1="0" y1="-6" x2="0" y2="6" stroke="#6c6cbd" stroke-width="2" />
            </g>
        </defs>
        <!-- 左侧 -->
        <g :fill="leftArrowColor" :stroke="leftArrowColor">
            <use href="#add-icon" :x="leftPoint.x" :y="leftPoint.y" @click="handleAdd(VertexType.left, shape)" />
        </g>
        <!-- 上侧 -->
        <g :fill="topArrowColor" :stroke="topArrowColor">
            <use href="#add-icon" :x="topPoint.x" :y="topPoint.y" @click="handleAdd(VertexType.top, shape)" />
        </g>
        <!-- 右侧 -->
        <g :fill="rightArrowColor" :stroke="rightArrowColor">
            <use href="#add-icon" :x="rightPoint.x" :y="rightPoint.y"  @click="handleAdd(VertexType.right, shape)" />
        </g>
        <!-- 下侧 -->
        <g :fill="bottomArrowColor" :stroke="bottomArrowColor">
            <use href="#add-icon" :x="bottomPoint.x" :y="bottomPoint.y" @click="handleAdd(VertexType.bottom, shape)" />
        </g>
    </g>
</template>
<style scoped>
.mind-map-quick-add-container {}
</style>