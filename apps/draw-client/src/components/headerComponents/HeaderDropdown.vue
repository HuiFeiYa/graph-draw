<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { HeaderDropdownData } from '../menuItem';
defineProps<{
    data: HeaderDropdownData,
}>()
const emit = defineEmits<{
    itemClick: () => void
}>()
</script>
<template>
    <div class="v-header-dropdown g-pointer g-pd-4 g-flex" :class="{ 'g-disabled': data.disabled }">
        <el-tooltip :show-after="500" placement="bottom"
            :disabled="data.disabled"
            :content="data.label + (data.keyboard ? `(${data.keyboard})` : '')">
            <el-dropdown>
                <span>
                    <img style="width: 16px" :src="data.icon" />
                    <span class="_span g-m-l-4">{{ data.label }}</span>
                    <img src="/statics/header/icontriangle.svg" />
                </span>
                <template #dropdown>
                    <div v-for="item in data.list" class="dropdown-item" 
                    style="width: 60px; display: flex; justify-content: center;align-items: center;height: 30px;" 
                    @click="emit('itemClick', item)">
                        <img style="width: 16px" :src="item.icon" />
                    </div>
                </template>
            </el-dropdown>
        </el-tooltip>
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
    }
</style>