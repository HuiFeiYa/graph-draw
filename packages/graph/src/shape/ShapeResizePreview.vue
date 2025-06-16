<template>
    <g>
      <rect
        :x="bounds.absX"
        :y="bounds.absY"
        :width="bounds.width"
        :height="bounds.height"
        fill="none"
        :stroke="color||'black'"
        style="pointer-events:none"
      ></rect>
  
    </g>
  </template>
  <script lang="ts" setup>
import { IBounds } from '@hfdraw/types';

  defineProps<{ bounds: IBounds, color?:string}>();
  
  </script>
  