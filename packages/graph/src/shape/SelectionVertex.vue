<script setup lang="ts">
import { EdgeShape, Shape, ShapeType } from '@hfdraw/types';
import { computed } from 'vue';
import { VertexType } from '../util/common';
const props = defineProps<{
    selection: Shape[]
}>();
console.log('selection:', props.selection)
const resizable = true;

const shapeGroup = computed(() => {
    let edgeShapes: EdgeShape[] = [];

    let commonShapes: Shape[] = [];

    props.selection.forEach(item => {
        if (item.shapeType === ShapeType.Edge) {
            edgeShapes.push(item as EdgeShape);
        } else {

            commonShapes.push(item);
        }
    })
    return {
        edgeShapes,
        commonShapes
    }
})

function handleMouseDown(event: MouseEvent, index: VertexType) {
    event.stopPropagation();
    //   emit('vertex-mousedown', event, index);

}
</script>
<template>
    <g>
        <!-- 偏移 padding 的距离 -->
        <g v-for="shape in shapeGroup.commonShapes" :key="shape.id" style="transform: translate(12px,12px);">
            <!-- 移动一半 rect 的宽高的距离 -->
            <rect :x="shape.bounds.absX - 6" :y="shape.bounds.absY - 6" width="6" height="6" fill="#000"
                :style="{ cursor: resizable ? 'nw-resize' : '' }" @mousedown="handleMouseDown($event, 1)" />
            <rect :x="shape.bounds.absX + shape.bounds.width" :y="shape.bounds.absY - 6" width="6" height="6"
                fill="#000" :style="{ cursor: resizable ? 'ne-resize' : '' }" @mousedown="handleMouseDown($event, 2)" />
            <rect :x="shape.bounds.absX + shape.bounds.width" :y="shape.bounds.absY + shape.bounds.height" width="6"
                height="6" fill="#000" :style="{ cursor: resizable ? 'se-resize' : '' }"
                @mousedown="handleMouseDown($event, 3)" />
            <rect :x="shape.bounds.absX - 6" :y="shape.bounds.absY + shape.bounds.height" width="6" height="6"
                fill="#000" :style="{ cursor: resizable ? 'sw-resize' : '' }" @mousedown="handleMouseDown($event, 4)" />
        </g>
    </g>
</template>