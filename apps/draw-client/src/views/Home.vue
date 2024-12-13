<template>
    <div style="display: flex;height: 100%;">
      <Siderbar  />
      <GraphView :graph="graph" style="flex:1"></GraphView>
    </div>
  </template>
  
  <script setup>
  import { reactive, ref  } from 'vue';
  import {GraphView} from '@hfdraw/graph'
  import Siderbar from '../editor/components/SiderBar.vue'
  const graph = ref({
    edges: [],
    symbols: []
  })
  </script>