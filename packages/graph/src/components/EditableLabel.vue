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
      :style="labelStyle" 
      @blur="endEdit"
      @keydown.enter="handleEnterKey"
    >
      {{ label }}
    </div>
  </foreignObject>
</template>

<script lang="ts" setup>
import { IBounds } from '@hfdraw/types';
import { ref, nextTick, computed } from 'vue';

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
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  fontColor?: string;
  lineHeight?: number;
  textAlign?: 'left' | 'center' | 'right';
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

const handleEnterKey = (event: KeyboardEvent) => {
    // 在编辑状态下，阻止默认行为并手动插入换行
    event.preventDefault();
    
    // 浏览器维护一个全局的Selection对象，
    // 表示当前用户选择的文本范围。一个Selection可以包含多个Range对象（虽然通常只有一个）
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      // 创建换行符节点
      const br = document.createElement('br');
      const newNode = document.createTextNode('\n');
      // 插入换行符
      range.deleteContents();
      range.insertNode(br);
      // 以br元素作为参考插入光标，它后面必须要有节点才能实现换行，所以这里又添加了一个 \n 文本节点
      range.insertNode(newNode);
      
      //  将光标移动到新行开头
      range.setStartAfter(br);
      /**
       * 必须通过removeAllRanges()和addRange()来：
        清除旧的选区状态
        应用我们修改后的新选区状态
       */
      selection.removeAllRanges();
      selection.addRange(range);
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

const labelStyle = computed(() => ({
  fontWeight: props.bold ? 'bold' : 'normal',
  fontStyle: props.italic ? 'italic' : 'normal',
  textDecoration: props.underline ? 'underline' : 'none',
  fontSize: props.fontSize ? props.fontSize + 'px' : undefined,
  width: props.nameBounds.width + 'px',
  height: props.nameBounds.height + 'px', 
  left: props.nameBounds.x + 'px',
  top: props.nameBounds.y + 'px',
  fontFamily: 'inherit',
  pointerEvents: 'all',
  padding: '0',
  margin: '0',
  display: 'flex',
  alignItems: 'center',
  color: props.fontColor,
  lineHeight: props.lineHeight ? props.lineHeight  : undefined
}));

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
  white-space: pre-wrap; /* 保持换行和空格 */
  word-wrap: break-word; /* 长单词自动换行 */
  justify-content: center;
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