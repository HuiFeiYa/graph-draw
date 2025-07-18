<script setup lang="ts">
import { Shape, ShapeType, ShapeKey, IBounds } from '@hfdraw/types';
import { computed, inject, ref } from 'vue';
import { createEventHandler } from '../util/createEventHandler';
import { GraphModel } from '../models/GraphModel';
import EditableLabel from '../components/EditableLabel.vue';
import EdgeParticle from './EdgeParticle.vue';
import { getLighterColor } from '@hfdraw/utils';

const props = defineProps<{
  shape: Shape
}>();

const graph = inject<GraphModel>('graph') as GraphModel;
const eventHandler = createEventHandler(graph, props);
const editableLabelRef = ref<InstanceType<typeof EditableLabel>>();
const isHovered = ref(false);

const highlight = computed(() => {
  return isHovered.value && graph.edgeMoveModel.showPreview
});
const handleMouseOver = () => {
  isHovered.value = true;
};
const handleMouseLeave = () => {
  isHovered.value = false;
};
const handleStartEdit = () => {
  editableLabelRef.value?.startEdit();
};
const handleEndEdit = (newText: string) => {
  graph.graphOption.saveText(props.shape, newText);
};

const style = computed(() => {
  const shape = props.shape;
  return Object.assign({}, shape.style);
});

// 选中时查找所有满足条件的 edge
const outgoingEdges = computed(() => {
  const edges = graph.symbols.filter(s => s.shapeType === ShapeType.Edge);
  return edges.filter(edge =>
    edge.sourceId === props.shape.id && !!edge.targetId && edge.waypoint && edge.waypoint.length > 1
  );
});

function getPolygonPath(bounds: IBounds, sides: number = 5): string {
    if (sides!== 5) {
        throw new Error('当前仅支持生成五边形路径');
    }

    const { absX, absY, width, height } = bounds;
    // 计算各关键位置坐标
    const topCenterX = absX + width / 2;
    const topCenterY = absY;
    const bottomLeftX = absX + width / 5;
    const bottomLeftY = absY + height;
    const bottomRightX = absX + width * 4 / 5;
    const bottomRightY = absY + height;
    const leftMiddleX = absX;
    const leftMiddleY = absY + height *2 / 5;
    const rightMiddleX = absX + width;
    const rightMiddleY = absY + height *2 / 5;

    // 五边形顶点坐标，按顺序连接
    const points = [
        [topCenterX, topCenterY],    // 顶部顶点
        [rightMiddleX, rightMiddleY], // 右边中间点
        [bottomRightX, bottomRightY], // 右下角
        [bottomLeftX, bottomLeftY],   // 左下角
        [leftMiddleX, leftMiddleY]    // 左边中间点
    ];

    // 构建 SVG path 路径
    let path = `M ${points[0][0]},${points[0][1]}`;
    for (let i = 1; i < points.length; i++) {
        path += ` L ${points[i][0]},${points[i][1]}`;
    }
    path += ' Z'; // 闭合路径

    return path;
}

function getRectPath(bounds: any): string {
  const { absX, absY, width, height } = bounds;
  return `M ${absX} ${absY} H ${absX + width} V ${absY + height} H ${absX} Z`;
}

const svgPath = computed(() => {
  if (props.shape.shapeKey === ShapeKey.Block) {
    return getRectPath(props.shape.bounds);
  } else if (props.shape.shapeKey === ShapeKey.Pentagon) {
    return getPolygonPath(props.shape.bounds, 5);
  }
  // 可扩展更多类型
  return props.shape.svgPath || '';
});
</script>

<template>
  <g
    @click.stop
    @mousedown.stop
    @mouseup.stop
    @mousemove.stop
    @dragenter.stop
    @dragleave.stop
    @drop.stop
    @dragover.stop
    style="cursor: pointer;"
    v-on="eventHandler"
    @dblclick="handleStartEdit"
    @mouseover="handleMouseOver"
    @mouseleave="handleMouseLeave"
  >
    <path
      :d="svgPath"
      :stroke="style.strokeColor"
      :stroke-width="style.strokeWidth"
      :fill="highlight ? getLighterColor(style.background || '') : style.background || ''"
      :stroke-dasharray="style.strokeDasharray || ''"
    />
    <EditableLabel
      ref="editableLabelRef"
      :bounds="shape.bounds"
      :name-bounds="shape.nameBounds"
      :label="shape.modelName || ''"
      :font-size="14"
      :bold="style.bold"
      :italic="style.italic"
      :underline="style.underline"
      :font-color="style.fontColor"
      :line-height="style.lineHeight"
      :text-align="style.textAlign"
      @end-edit="handleEndEdit"
    />
    <!-- 选中时渲染粒子动画 -->
    <template v-if="graph.selectionModel.selectedShapes.includes(props.shape)">
      <EdgeParticle
        v-for="edge in outgoingEdges"
        :key="edge.id"
        :waypoint="edge.waypoint"
      />
    </template>
  </g>
</template>

<style lang="scss" scoped>
/* 可根据需要添加样式 */
</style>
