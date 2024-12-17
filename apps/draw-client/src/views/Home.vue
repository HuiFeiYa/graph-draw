<template>
    <div style="display: flex;height: 100%;">
      <Siderbar  />
      <GraphView :graph="graph" style="flex:1"></GraphView>
    </div>
  </template>
  
  <script setup lang="ts">
  import { reactive, ref  } from 'vue';
  import {GraphView} from '@hfdraw/graph'
  import { Shape } from '@hfdraw/types' 
  import Siderbar from '../editor/components/SiderBar.vue'
import { BusEvent } from '../constants/config';
  const graph = ref({
    edges: [],
    symbols: []
  })
  const events = {
    [BusEvent.INSERT_SHAPE]: (shape: Shape) => {},
    [BusEvent.DELETE_SHAPE]: (shape: Shape) => {},
    [BusEvent.UPDATE_SHAPE]: async (shape: Shape) => {}
  }
  </script>