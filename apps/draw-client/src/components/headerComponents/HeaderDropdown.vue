<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { HeaderDropdownData, HeaderButtonData } from '../menuItem';
defineProps<{
    data: HeaderDropdownData,
    disabled?: boolean
}>()
const emit = defineEmits<{
    itemClick: (item: any, value: any) => any
}>()
</script>
<template>
    <div class="v-header-dropdown g-pointer g-pd-4 g-flex" :class="{ 'g-disabled': data.disabled }" >
        
            <el-dropdown trigger="click" :hide-on-click="false" placement="bottom-start" :disabled="disabled">
                <span style="font-size: 12px;" :style="{filter: disabled ? 'grayscale(100%)' : '', opacity: disabled ? 0.5 : 1}">
                    <img style="width: 16px" :src="data.icon" />
                    <span class="_span g-m-l-4">{{ data.label }}</span>
                    <img src="/statics/header/icontriangle.svg" />
                </span>
                <template #dropdown>
                    <div v-for="item in data.list" class="dropdown-item" 
                    style="width: 60px; display: flex; justify-content: center;align-items: center;height: 30px;" 
                    @click="emit('itemClick', item, data.value)">
                        <img v-if="item.icon" style="width: 16px" :src="item.icon" />
                        <span >{{ item.label }}</span>
                    </div>
                </template>
            </el-dropdown>
    </div>
</template>

<style lang="scss" scoped>
.v-header-dropdown {
    white-space: nowrap;
    height: 24px;
    padding-right: 2px;

    ._span {
        vertical-align: middle;
    }
    
}
.dropdown-item {
        &:hover {
            background: #eee;
        }
        min-width: 80px;
    }
</style>