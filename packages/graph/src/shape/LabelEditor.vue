<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { LabelEditorModel } from '../models/LabelEditorModel';
import { Bounds, Shape } from '@hfdraw/types';
import {  getTextSize } from '@hfdraw/utils'
const props = defineProps<{
  editorModel:LabelEditorModel
}>();
const emit = defineEmits<{
  (e: 'input',text: string, textarea: {clientX: number; clientY: number}, shape?: Shape): void,
  (e: 'blur'):void
}>();
const textWidth = ref(0);
const textHeight = ref(0);
const textarea = ref<any>(null);
const rectBounding = ref({ clientX: 0, clientY: 0 });
onMounted(() => {
  if (textarea.value) {
    textarea.value.focus();
    props.editorModel.textareaRef = textarea.value;
    const rect = textarea.value.$el.getBoundingClientRect();
    rectBounding.value = {
      clientX: rect.x,
      clientY: rect.y
    };
  }
});
const previewBounds = computed(() => {
  let bounds = props.editorModel.bounds as Bounds;
  return bounds ? {
    absX: bounds.absX,
    absY: bounds.absY,
    width: bounds.width,
    height: Math.max(bounds.height, textHeight.value) // todo 改为跟服务端获取高度一致的方法
  } : {};
});

function handleInput(value: string) {
  emit('input', value, rectBounding.value, props.editorModel.editingShape);
  const height = getTextSize(value, props.editorModel.style.fontSize || 12, props.editorModel.editingShape?.nameBounds.width || 100 ).height;
  textHeight.value = height;
}

function handleSave() {
  emit('blur');
}
</script>
<template>
  <g>
    <foreignObject
      :width="previewBounds.width"
      :height="previewBounds.height"
      :x="previewBounds.absX"
      :y="previewBounds.absY"

    >
      <el-input
        ref="textarea"
        v-model="editorModel.text"
        type="textarea"
        :autosize="{ minRows: 2 }"
        placeholder="请输入内容"
        class="v-label-Editor"
        :style="{
          background: editorModel.style.background,
          fontSize: '14px',
          fontFamily: 'inherit'
        }"
        @input="handleInput"
        @blur="handleSave"
      />
    </foreignObject>
  </g>
</template>
<style scoped lang="scss">
.v-label-Editor {
  width: 100%;
  
  :deep(.el-textarea) {
    position: absolute;
    width: 100%;
    height: 100%;
  }
  
  :deep(.el-textarea__inner) {
    border: none;
    outline: none;
    resize: none;
    line-height: normal;
    height:100%;
    border: 1px solid red;
    box-shadow: none;
    &:focus {
      border: none;
      outline: none;
      box-shadow: none;
      height:100%;
      border: 1px solid red;
    }
  }
}
</style>