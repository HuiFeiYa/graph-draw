<template>
  <g
    @click.stop
    @mousedown.stop
    @mouseup.stop
    @mousemove.stop
    @dragenter.stop
    @dragleave.stop
    @drop.stop
    @dragover.stop
  >
    <rect
      :x="shape.bounds.absX"
      :y="shape.bounds.absY"
      :width="shape.bounds.width"
      :height="shape.bounds.height "
      :stroke="style.strokeColor"
      :stroke-width="style.strokeWidth"
      style="fill:white;"
      :rx="style.borderRadius||0"
      :ry="style.borderRadius||0"
      :stroke-dasharray="style.strokeDasharray || ''"
       v-on="eventHandler"
    >
    <foreignObject
      :width="shape.bounds.width"
      :height="shape.bounds.height"
      :x="shape.bounds.absX"
      :y="shape.bounds.absY"
      style="overflow:visible"
     
    ></foreignObject>
  </rect>
</g>
</template>
<script lang="ts" setup>
import { Shape } from '@hfdraw/types';
import { computed } from 'vue';
import { createEventHandler } from '../util/createEventHandler';

const props = defineProps<{
  shape:Shape
}>();
// 绑定图形的操作，并将 shape 作为参数
const eventHandler = createEventHandler( props);
const style = computed(() => {
  const shape = props.shape;

  return Object.assign({}, shape.style);
});
</script>
<style lang="scss">
// foreignObject内部div的通用样式
.tagged-values-container {
  display: flex;
  .tagged-values-box {
    display: flex;
    flex-direction: column;
    .tagged-values-rich-text-container {
      em {
      font-style:italic;
      margin-left: 12px;
      }
    ol >li{
      list-style:decimal;
      margin-left: 12px;
    }
    ul >li{
      list-style-type: disc;
    }
      display: flex;
      .tagged-values-rich-text-box{
        display: flex;
        flex-direction: column;
        .tagged-values-rich-text-content {
          display: flex;
        }
      }
    }

  }
  .semicolon {
    position: relative;
    white-space: pre;
    display: flex;
    span.bottom {
      align-self: flex-end;
    }
  }
}

.show-underline {
  text-decoration: underline;
}
</style>