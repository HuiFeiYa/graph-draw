<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { PopoverListItem, PopoverListItemType } from '../types/ui'
const props = defineProps<PopoverListItem>()

const columns = computed(()=> {
    return props.type === PopoverListItemType.horizontal ?  `repeat(${props.list.length}, 1fr)` : '1fr'
})
</script>
<template>
<div class="m-popover" :style="{left: x + 'px', top: y + 'px', 'grid-template-columns':  columns}"  >
    <div v-for="item in list" :key="item.modelId" >
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