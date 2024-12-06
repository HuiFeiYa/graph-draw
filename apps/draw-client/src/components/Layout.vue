<template>
    <div class="v-layout">
        <div class="_layout-content" @dragover.stop.prevent >
            <m-header  class="v-layout-header"/>
            <router-view />
        </div>
    </div>
</template>
<script setup>
import MHeader from './Header.vue'
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

    }

}
</style>