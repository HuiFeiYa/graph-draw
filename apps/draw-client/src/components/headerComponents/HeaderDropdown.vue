<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { HeaderDropdownData, HeaderButtonData } from '../menuItem';
const props = defineProps<{
    data: HeaderDropdownData,
    disabled?: boolean,
    defaultSelectIcon?: string
}>()
const emit = defineEmits<{
    itemClick: (item: any, value: any) => any
}>()
const selectIcon = ref<any>(props.defaultSelectIcon)
function handleItemClick(item: any, data:HeaderDropdownData) {
    emit('itemClick', item, data.value)
    if (data.needSelectIcon) {
        selectIcon.value = item.icon;
    }
}
onMounted(() => {
    if (props.data.needSelectIcon) {
        selectIcon.value = props.data.list[0]?.icon || '';
    }
})
// 监听默认选中图标变化
watch(() => props.defaultSelectIcon, (newVal) => {
    selectIcon.value = newVal;
})
</script>
<template>
    <div class="v-header-dropdown g-pointer g-pd-4 g-flex" :class="{ 'g-disabled': data.disabled }" >
        
            <el-dropdown trigger="click" :hide-on-click="false" placement="bottom-start" :disabled="disabled">
                <span style="font-size: 12px;" :style="{filter: disabled ? 'grayscale(100%)' : '', opacity: disabled ? 0.5 : 1}">
                    <img v-if="data.icon" style="width: 16px" :src="data.icon" />
                    <img v-if="selectIcon && data.needSelectIcon" style="width: 16px" :src="selectIcon" />
                    <span v-if="data.label" class="_span g-m-l-4">{{ data.label }}</span>
                    <img src="/statics/header/icontriangle.svg" />
                </span>
                <template #dropdown>
                    <div v-for="item in data.list" class="dropdown-item" 
                    style="width: 60px; display: flex; justify-content: center;align-items: center;height: 30px;" 
                    @click="handleItemClick(item, data)">
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