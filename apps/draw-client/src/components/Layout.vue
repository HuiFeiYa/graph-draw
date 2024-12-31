<template>
    <div class="v-layout">
        <m-window-bar />
        <m-header  class="v-layout-header"/>
        <div class="_layout-content" @dragover.stop.prevent >
            <router-view />
        <div v-if="popoverList.length > 0">
            <Popover v-for="(item,index) in popoverList" :key="index" v-bind="item" />
        </div>

        </div>
    </div>
</template>
<script setup lang="ts">
import MHeader from './Header.vue'
import MWindowBar from './WindowBar.vue';
import { useUiStore } from '../stores/ui'
import { storeToRefs } from 'pinia'
import Popover from '../components/Popver.vue'


const uiStore = useUiStore();
const { popoverList } = storeToRefs(uiStore)
</script>
<style lang="scss">
.v-layout {
    height: 100%;
    width: 100%;
    background: #f5f5f5;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    .v-window-bar {
        flex: 0 0 auto;
        height: 28px;
        overflow: hidden;

    }

    .v-layout-header {
        flex: 0 0 auto;
        height: 61px;
        overflow: hidden;

    }

    ._layout-content {
        flex: 1 1 auto;
        overflow: hidden;
        position: relative;
    }

}
</style>