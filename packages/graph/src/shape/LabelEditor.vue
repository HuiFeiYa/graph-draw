<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { LabelEditorModel } from '../models/LabelEditorModel';
import { Bounds, Shape } from '@hfdraw/types';
import { getTextSize } from '../util/common';
import { calculateTextHeight } from '@hfdraw/utils'
const props = defineProps<{
  editorModel:LabelEditorModel
}>();
const emit = defineEmits<{
  (e: 'input',text: string, textarea: {clientX: number; clientY: number}, shape?: Shape): void,
  (e: 'blur'):void
}>();
const textWidth = ref(0);
const textHeight = ref(0);
const textarea = ref<HTMLInputElement|null>(null);
const rectBounding = ref({ clientX: 0, clientY: 0 });
onMounted(() => {
  if (textarea.value) {
    textarea.value.focus();
    props.editorModel.textareaRef = textarea.value;
    const rect = textarea.value.getBoundingClientRect();
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

function handleInput(event:Event) {
  let text = (event.target as HTMLInputElement).value;
  emit('input', text, rectBounding.value, props.editorModel.editingShape);
  // const size = getTextSize(text, props.editorModel.style.fontSize || 12, props.editorModel.editingShape?.nameBounds.width); 
  const height = calculateTextHeight(text, props.editorModel.style.fontSize || 12);
  // textWidth.value = size.width;
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
    <!-- todo 限制编辑时的宽度，和自动撑开 -->
      <textarea
        id="graph"
        ref="textarea"
        :value="editorModel.text"
        class="v-label-Editor"
        style="width:100%;height:100%;background: transparent;word-break: break-all;"
        :spellcheck="false"
        :style="{
          fontSize:editorModel.style.fontSize+'px',
          fontWeight:editorModel.style.fontWeight,
          background:editorModel.style.background,
          lineHeight: 1.5,
        }"
        @input="handleInput"
        @blur="handleSave"
      />
    </foreignObject>
  </g>
</template>
<style scoped lang="scss">
.v-label-Editor {
  position: absolute;
  pointer-events: all;
  border: none;
  outline: none;
  display: block;
  resize: none;
  font-family: pingfang SC, helvetica neue, arial, hiragino sans gb, microsoft yahei ui,
   microsoft yahei, simsun, sans-serif, PingFangSC-Medium, -apple-system,
   BlinkMacSystemFont, segoe ui, Roboto, Arial, noto sans,
   apple color emoji, segoe ui emoji, segoe ui symbol, noto color emoji;
  &:focus-visible {
      outline: none;

  }
  overflow: hidden;

}
</style>