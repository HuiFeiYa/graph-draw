<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount } from 'vue';
import { PopoverListItem, PopoverListItemType } from '../types/ui'
import { shapeService } from '../util/ShapeService';
import { useProjectStore } from '../stores/project';
import { useUiStore } from '../stores/ui';
import { BusEvent, SidebarKeyItem } from '../constants/config';
import { emitter } from '../util/Emitter';
const projectStore = useProjectStore();
const uiStore = useUiStore();
const props = defineProps<PopoverListItem>()

const columns = computed(()=> {
    return props.type === PopoverListItemType.horizontal ?  `repeat(${props.list.length}, 1fr)` : '1fr'
})

async function handleCreate(item: SidebarKeyItem) {
  const uiStore = useUiStore();
  const direction = uiStore.popoverDirection ; // 默认右
  let sourceConnection: [number, number];
  let targetConnection: [number, number];
  switch (direction) {
    case 'left':
      sourceConnection = [0, 0.5];
      targetConnection = [1, 0.5];
      break;
    case 'right':
      sourceConnection = [1, 0.5];
      targetConnection = [0, 0.5];
      break;
    case 'top':
      sourceConnection = [0.5, 0];
      targetConnection = [0.5, 1];
      break;
    case 'bottom':
      sourceConnection = [0.5, 1];
      targetConnection = [0.5, 0];
      break;
    default:
      sourceConnection = [1, 0.5];
      targetConnection = [0, 0.5];
  }
  await shapeService.connectShapeAndCreate({
    projectId: projectStore.projectId,
    sourceShapeId: props.shape.id,
    index: props.index,
    modelId: item.sidebarKey,
    sourceConnection,
    targetConnection
  });
  clear();
}
function _clear() {
    uiStore.clearPopoverList()
}
async function clear() {
    _clear();
    // 通知 flow 页面，调用 graph 的 mouseDownOut 方法，清除鼠标悬浮状态
    emitter.emit(BusEvent.MOUSE_DOWN_OUT, window.event, undefined);
}
onMounted(() => {
    emitter.on(BusEvent.CLEAR_HOVER_SHAPE, _clear);
})
onBeforeUnmount(() => {
    emitter.off(BusEvent.CLEAR_HOVER_SHAPE, _clear);
})
</script>
<template>
<div class="m-popover" :style="{left: x + 'px', top: y + 'px', 'grid-template-columns':  columns}"  @mouseleave="clear">
    <div v-for="item in list" :key="item.modelId" @click="handleCreate(item)">
        <img style="width: 30px;cursor: pointer;" :src="item.showData.icon">
    </div>
</div>
</template>

<style>
.m-popover {
    display: grid;
    z-index: 2069;
    position: absolute;
    inset: 528px auto auto 309px;
    background: rgba(0, 0, 0, 0.1);
    border-radius: 12px;
    padding: 6px 10px;
    grid-row-gap: 10px; /* 行间隙 */
    grid-column-gap: 10px; /* 列间隙 */
}
</style>