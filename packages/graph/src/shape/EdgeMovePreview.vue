<template>
    <g >
      <path
        :d="previewPath"
        :stroke="strokeColor"
        stroke-dasharray="10 8"
        fill="none"
        stroke-width="2"
        stroke-miterlimit="10"
        stroke-linejoin="round"
      />
    </g>
  </template>
  <script lang="ts" setup>
  defineProps<{
    previewPath: string
    strokeColor: string
  }>();
  
  </script>
  