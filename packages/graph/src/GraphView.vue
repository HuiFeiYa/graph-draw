<script setup lang="ts">
import { provide, computed, onMounted, ref, onUnmounted } from "vue";
import Grid from './components/grid.vue'
import DiagramShape from "./DiagramShape.vue";
import { Graph } from "./types";
const props = defineProps<{
  graph: Graph,
}>();
provide("graph", props.graph);
const viewDom = ref(null);



function handleClickOut() { }
// 监听画布上点击事件，用于清空选中状态
function handleMousedownOut() {
}
function handleMouseupOut() {
  
}
function handleMousemove() {
}
function handleDragOver() { }

const handleDrop = () => { };
onMounted(() => {

});

onUnmounted(() => {
})
</script>
<template>
  <div class="graph-view" ref="viewDom">
    <!-- 
          展示层
          * 整个画布的事件监听
        -->
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" transform-origin="0 0"
      style="min-width: 100%; min-height: 100%;background-color: white;" @click="handleClickOut"
      @mousedown="handleMousedownOut" @mouseup="handleMouseupOut" @mousemove="handleMousemove"
      @dragover="handleDragOver" @drop.stop="handleDrop">
      <Grid/>
      <DiagramShape :graph="graph"/>
    </svg>
  </div>
</template>
<style>
.graph-view {
  position: relative;
  padding: 12px;
  
}
svg {
    image-rendering: optimizeQuality;
  }
</style>
