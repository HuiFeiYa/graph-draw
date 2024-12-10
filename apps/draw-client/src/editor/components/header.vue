<script setup >
import { computed, ref } from "vue";
import { HeaderHeight } from "@/constants/config.js";
const props = defineProps();
const currentStep = ref('');
const selectedShapes = computed(() => {
  return props.graph.selectionModel.selectedShapes;
});
const hasSelectedShape = computed(() => {
  return selectedShapes.value.length > 0;
});


const deleteHandler = () => {
};
const restoreShape = async (value) => {
};
const undoHandler = () => {

};

const redoHandler = () => {
  
};

const resetHandler = () => {
 
};
</script>

<template>
  <div class="toolbar" :style="{ height: HeaderHeight + 'px' }">
    <el-tooltip effect="dark" content="删除元素" placement="top-start">
      <el-button text @click="resetHandler">清空画布</el-button>
    </el-tooltip>
    <el-tooltip effect="dark" content="撤销" placement="top-start">
      <el-button text @click="undoHandler" :disabled="!currentStep.hasPrev">
        <el-image src="src/assets/undo.svg" :style="currentStep.hasPrev ? {} : { filter: 'grayscale(85%)' }"></el-image>
      </el-button>
    </el-tooltip>
    <el-tooltip effect="dark" content="重做" placement="top-start">
      <el-button text :disabled="!currentStep.hasNext" @click="redoHandler">
        <el-image src="src/assets/redo.svg" :style="currentStep.hasNext ? {} : { filter: 'grayscale(85%)' }"></el-image>
      </el-button>
    </el-tooltip>
    <el-tooltip effect="dark" content="删除元素" placement="top-start">
      <el-button :disabled="!hasSelectedShape" icon="delete" text @click="deleteHandler"></el-button>
    </el-tooltip>
  </div>
</template>
<style>
.close {
  width: 20px;
  height: 20px;
}

.common-item {
  cursor: pointer;
  text-align: center;
  user-select: none;
}

.toolbar {
  display: flex;
  align-items: center;
  width: 100%;
  border-bottom: 1px solid #dadce0;
  padding: 0 10px;
  box-sizing: border-box;
}

.undo img {
  color: #c1c5cb;
}
</style>
