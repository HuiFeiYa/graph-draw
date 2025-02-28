<script setup lang="ts">
import { curve } from '@hfdraw/elbow';
import { Shape } from '@hfdraw/types';
import { computed, ref } from 'vue'
import { GraphModel } from '../models/GraphModel';
const props = defineProps<{
    shape: Shape;
    graph: GraphModel
}>();
const pathArray = computed(() => {
    const pathArr: {
        linePath: string, // 曲线
        color: string
    }[] = [];
    const shapeDepth = props.shape.style.retrospectOption?.shapeDepth;
    const shapeId = props.shape.id;
    const sourceBounds = props.shape.bounds;
    // 关联的下一级图形
    props.shape.style.retrospectOption?.relationTypes?.forEach(
        (item) => {
            const shapes = props.graph.symbols;
            let targetShape = shapes?.find(
                (one) =>
                    shapeDepth &&
                    one.style.retrospectOption?.shapeDepth ===
                    shapeDepth + 1 && one.id === item.shapeId
            );
            if (!targetShape) {
                return;
            }
            const targetBounds = targetShape.bounds;

            // 计算矩形1的右侧重点和矩形2的左侧中点
            const point1 = {
                x: sourceBounds.absX + sourceBounds.width,
                y: sourceBounds.absY + sourceBounds.height / 2
            };

            const point2 = {
                x: targetBounds.absX,
                y: targetBounds.absY + targetBounds.height / 2
            };
            /** *
                 * 根据两个点的位置去绘制一个曲线 linePath
                 */
            // 颜色
            let color = "black";
            const bezierRes = curve.drawThirdOrderBezierForRetrospect(point1, point2);
            const { linePath } = bezierRes;

            pathArr.push({
                linePath: linePath, // 曲线
                color: color
            });
        }
    );
    return pathArr;
});

</script>
<template>
    <g @click.stop @mousedown.stop @mouseup.stop @mousemove.stop @dragenter.stop @dragleave.stop @drop.stop
        @dragover.stop>
        <path v-for="path in pathArray" :key="path.linePath" :d="path.linePath" :stroke="path.color" stroke-width="2" fill="none" />
    </g>
</template>
<style scoped></style>