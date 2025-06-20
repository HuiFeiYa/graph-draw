<template>
  <foreignObject
    :width="bounds.width"
    :height="bounds.height"
    :x="bounds.absX"
    :y="bounds.absY"
    style="overflow: visible;"
  >
    <div 
      ref="labelRef"
      class="v-editable-label" 
      :style="{
        width: nameBounds.width + 'px',
        height: nameBounds.height + 'px', 
        left: nameBounds.x + 'px',
        top: nameBounds.y + 'px',
        fontSize: fontSize + 'px',
        fontFamily: 'inherit',
        pointerEvents: 'all',
        padding: '0',
        margin: '0',
        display: 'flex',
        alignItems: 'center',
        lineHeight: 1.5
      }" 
      @blur="endEdit"
      @keydown.enter="endEdit"
    >
      {{ label }}
    </div>
  </foreignObject>
</template>

<script lang="ts" setup>
import { IBounds } from '@hfdraw/types';
import { ref, nextTick } from 'vue';

interface Props {
  bounds: IBounds;
  nameBounds: {
    width: number;
    height: number;
    x: number;
    y: number;
  };
  label: string;
  fontSize?: number;
}

const props = withDefaults(defineProps<Props>(), {
  fontSize: 14
});

const emit = defineEmits<{
  startEdit: [];
  endEdit: [text: string];
  textChange: [text: string];
}>();

const labelRef = ref<HTMLDivElement>();

const startEdit = () => {
  if (labelRef.value) {
    labelRef.value.contentEditable = 'true';
    emit('startEdit');
    nextTick(() => {
      if (!labelRef.value) {
        return;
      }
      labelRef.value.focus();
      // 选中所有文案
      const range = document.createRange();
      range.selectNodeContents(labelRef.value);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    });
  }
};

const endEdit = () => {
  if (labelRef.value) {
    const newText = labelRef.value.innerText;
    labelRef.value.contentEditable = 'false';
    emit('endEdit', newText);
    emit('textChange', newText);
  }
};

// 暴露方法供父组件调用
defineExpose({
  startEdit,
  endEdit
});
</script>

<style lang="scss" scoped>
.v-editable-label {
  position: absolute;
  pointer-events: all;
  border: none;
  outline: none;
  display: block;
  resize: none;
  pointer-events: none;
  font-size: 14px;
  height: 100%;
  
  &:focus-visible {
    outline: none;
  }
  
  overflow: visible;
  
  &[contenteditable="true"] {
    pointer-events: all;
    background-color: rgba(255, 255, 255, 0.9);
  }
}

</style>