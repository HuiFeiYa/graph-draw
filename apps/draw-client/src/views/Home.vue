<template>
    <div style="display: flex;height: 100%;">
      <Siderbar  />
      <GraphView :graph="editor.graph" style="flex:1"></GraphView>
    </div>
  </template>
  
  <script setup>
  import { reactive  } from 'vue';
  import {GraphView} from '@hfdraw/graph'
  import Siderbar from '../editor/components/SiderBar.vue'
  import { GraphEditor } from '../editor/graphEditor'

  const editor = reactive(new GraphEditor({ modelId: 'a-1' }))
  </script>