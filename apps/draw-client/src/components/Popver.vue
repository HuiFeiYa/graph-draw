<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { PopoverListItem } from '../types/ui'
const props = defineProps<PopoverListItem>()
</script>
<template>
<div class="m-popover" :style="{left:props.x, right: props.y}">
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