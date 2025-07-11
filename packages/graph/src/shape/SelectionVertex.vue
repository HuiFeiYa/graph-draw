<script setup lang="ts">
import { EdgeShape, EventType, IPoint, Shape, ShapeType } from '@hfdraw/types';
import { computed, inject } from 'vue';
import { isEqual } from 'lodash';
import { VertexType } from '../util/common';
import { GraphModel } from '../models/GraphModel';
import { Point } from '../util/Point';
import { getInvertColor, getLighterColor } from '@hfdraw/utils';
const props = defineProps<{
    selection: Shape[]
}>();

const graph = inject<GraphModel>('graph') as GraphModel;
const emit = defineEmits<{
  (event: 'change'): void
  (event: 'vertex-mousedown', evt: MouseEvent, index: number): void
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

const edgeShapeWaypoint = computed(()=> {
    if(shapeGroup.value.edgeShapes.length > 0) {
        const edge = shapeGroup.value.edgeShapes[0];
        return edge.waypoint;
    }
    return []
})

const isShowEdgeWaypoint = computed(()=> {
    return edgeShapeWaypoint.value.length > 0;
})
const waypointsInline = computed((oldValue: IPoint[] | undefined)=> {
    const waypoints = edgeShapeWaypoint.value;
    if (waypoints.length <= 2) {
        return waypoints;
    }
    
    const newWaypoints:IPoint[] = [];
    for(let i = 0; i <= waypoints.length; i++) {
        if(i === 0) {
            newWaypoints.push(waypoints[i]);
            continue;
        }
        if (i === waypoints.length) {
            newWaypoints.push(waypoints[i-1]);
            continue;
        }
        
        // 对于中间的点，计算前一个点和后一个点的中点
        const prevPoint = waypoints[i - 1];
        const curPoint = waypoints[i];
        const midX = (prevPoint.x + curPoint.x) / 2;
        const midY = (prevPoint.y + curPoint.y) / 2;
        
        newWaypoints.push(new Point(midX, midY)) ;
    }
    
    if (oldValue && isEqual(oldValue, newWaypoints)) {
        return oldValue;
    }
    return newWaypoints;
})

const waypointsNotInline = computed((oldValue: IPoint[] | undefined)=> {
    const newWaypoints = edgeShapeWaypoint.value.slice(1,-1)
    if (oldValue && isEqual(oldValue, newWaypoints)) {
        return oldValue;
    }
    return newWaypoints;
})

function handleMouseDown(event: MouseEvent, index: VertexType) {
    event.stopPropagation();
      emit('vertex-mousedown', event, index);

}

function handleCircleMouseDown(event: MouseEvent, index:number) {
    event.stopPropagation();
    emit('vertex-mousedown', event, index);
}
function getCircleStyle(index: number) {
    const {edgeShapes, commonShapes} = shapeGroup.value;
    const style = commonShapes[0]?.style || edgeShapes[0]?.style;
    if (index === 0 || index === waypointsInline.value.length - 1) {
        return {
            fill: 'none',
            strokeWidth: '2px',
            stroke: getInvertColor(style.background || 'rgba(21,71, 146,0.5)')
        }
    } else if (index > 1 && index < waypointsInline.value.length - 2) {
        return {
            fill: getInvertColor(style.background || 'rgba(21,71, 146,0.5)'),
            strokeWidth: 0,
        }
    }
    return {}
}

</script>
<template>
    <g style="pointer-events:all">
        <!-- 偏移 padding 的距离 -->
        <g v-for="shape in shapeGroup.commonShapes" :key="shape.id" >
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
        <g v-if="isShowEdgeWaypoint">
            <circle style="cursor: move;pointer-events: all" 
                class="default-point"
                :style="getCircleStyle(i)"
                v-for="(item,i) in waypointsInline" :cx="item.x" :cy="item.y" r="4" 
                @mousedown="handleCircleMouseDown($event, i)"
                />
        </g>
    </g>
</template>
<style lang="scss" scoped>
.default-point {
    fill: transparent;
    stroke-width: 0;
}
// .start-end-point {
//     fill: none;
//     stroke-width:1px;
//     stroke: blue;
// }
// .point {
//     fill: #9b9bdd;
//     stroke-width: 0;
// }

</style>
