<script setup lang="ts">
import { EventType, Shape } from '@hfdraw/types';
import { ref, computed, onMounted  } from 'vue'
import { createEventHandler } from '../util/createEventHandler';
import { emitter } from '../util/Emitter';
import { GraphModel } from '../main';
import { EXPAND_GAP, EXPAND_ICON_R } from '../util/constant';

const props = defineProps<{
  shape: Shape
  graph: GraphModel
}>();

// 绑定图形的操作，并将 shape 作为参数
const eventHandler = createEventHandler(props, {omit: ['mouseover', 'dragover']});

const retrospectOption = computed(() => {
  return {
      expand: props.shape.style.retrospectOption?.expand,
      relationTypes: props.shape.style.retrospectOption?.relationTypes || []
  }
});
const isShowName = computed(() => {
  return props.graph.labelEditorModel.editingShape?.id !== props.shape.id  && props.shape.modelName
})
const expand = computed(() => {
  return props.shape.style.retrospectOption?.expand
})

const iconPosition = computed(() => {
  return {
    x: props.shape.bounds.absX + props.shape.bounds.width + EXPAND_GAP,
    y: props.shape.bounds.absY + (props.shape.bounds.height ) / 2 
  }
})
const textPosition = computed(() => {
  return {
    x: props.shape.bounds.absX + props.shape.bounds.width  + 10,
    y: props.shape.bounds.absY + (props.shape.bounds.height ) / 2 + 4
  }
})
const closeLinePosition = computed(()=> {
  return {
    x: props.shape.bounds.absX + props.shape.bounds.width  + 9,
    y: props.shape.bounds.absY + (props.shape.bounds.height ) / 2 
  }
  
})
const style = computed(() => {
  const shape = props.shape;

  return Object.assign({}, shape.style);
});


function handleExpandShape(){
  props.graph.graphOption.expandShape(props.shape.id, !retrospectOption.value.expand || false);
}

function handleNameLabelClick(event: MouseEvent) {
  emitter.emit(EventType.NAME_LABEL_CLICK, event, props.shape);
}
</script>
<template>
  <g style="cursor: pointer;">
    <rect
      :x="shape.bounds.absX"
      :y="shape.bounds.absY"
      :width="shape.bounds.width"
      :height="shape.bounds.height "
      :stroke="style.stroke"
      :stroke-width="style.strokeWidth"
      fill="#fff"
      :rx="style.borderRadius||0"
      :ry="style.borderRadius||0"
       v-on="eventHandler"
       @click="handleNameLabelClick"
    />
          <!-- 展开收起 icon -->
           <g v-if="retrospectOption.relationTypes.length" @click="handleExpandShape">
            <circle :cx="iconPosition.x" :cy="iconPosition.y" :r="EXPAND_ICON_R" fill="none" :stroke="style.stroke" stroke-width="1"/>
            <path v-if="expand" :d="`M ${closeLinePosition.x} ${closeLinePosition.y} l10 0`"  :stroke="style.stroke" stroke-width="2"/>
            <text v-else :x="textPosition.x" :y="textPosition.y" fill="#666" font-size="12">{{ retrospectOption.relationTypes.length }}</text>
           </g>


    <!-- 文本 -->

    <foreignObject v-if="isShowName" :x="shape.nameBounds.absX" :y="shape.nameBounds.absY" :width="shape.nameBounds.width" :height="shape.nameBounds.height">
      <div style="pointer-events:auto;line-height: 1.5;" :style="{fontSize: shape.style.fontSize+'px'}"  @click="handleNameLabelClick" >
        {{ shape.modelName }}
      </div>
    </foreignObject>
  </g>
</template>
<style scoped>
</style>