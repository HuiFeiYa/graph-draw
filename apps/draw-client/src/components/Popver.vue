<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
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

async function  handleCreate(item:SidebarKeyItem) {
    await shapeService.connectShapeAndCreate({
        projectId: projectStore.projectId,
        sourceShapeId: props.shape.id,
        index: props.index,
        modelId: item.sidebarKey,
        sourceConnection: [1,0.5],
        targetConnection: [0, 0.5]
    });
    clear();
}
async function clear() {
    uiStore.clearPopoverList()
    // 通知 flow 页面，调用 graph 的 mouseDownOut 方法，清除鼠标悬浮状态
    emitter.emit(BusEvent.MOUSE_DOWN_OUT, window.event, undefined);
}
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