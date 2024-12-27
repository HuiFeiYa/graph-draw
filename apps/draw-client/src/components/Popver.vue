<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { PopoverListItem } from '../types/ui'
import { popoverWidth } from '../constants/config'
const props = defineProps<PopoverListItem>()
console.log('props:',props)
</script>
<template>
<div class="m-popover" :style="{left: x + 'px', top: y + 'px', width: popoverWidth + 'px'}" >
    {{ x }} {{ y }}
</div>
</template>

<style>
.m-popover {
    z-index: 2069;
    position: absolute;
    inset: 528px auto auto 309px;
    width: 200px;
}
</style>