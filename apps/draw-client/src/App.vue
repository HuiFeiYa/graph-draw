<script setup>
import { add } from '@hfdraw/utils'
import {GraphView} from '@hfdraw/graph'
import HelloWorld from './components/HelloWorld.vue'
const res = add(1,2)
console.log('res:', res)
</script>

<template>
  <GraphView/>
  <HelloWorld msg="Vite + Vue" />
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
