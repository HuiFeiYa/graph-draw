<script setup lang="ts">
import { ref } from "vue";
// @ts-ignore
import { SideBarWidth, sideBarList } from '@/constants/config';
import { shapeService } from "../../util/ShapeService";
import { SideBarDropDto } from "../../types/shape.dto";
import { useProjectStore } from '../../stores/project';
import { useUiStore } from '../../stores/ui';
import { SidebarKeyItem } from "../../constants/config";
const props = defineProps();
const active = ref("common");
const projectStore = useProjectStore();
const uiStore = useUiStore();

const onMousedown = async (item:SidebarKeyItem) => {
  const nextPosition = uiStore.getNextDropPosition();
  const params:SideBarDropDto = {
    point: nextPosition,
    projectId: projectStore.projectId,
    stType: item.sidebarKey
  }
  const res = await shapeService.sidebarDrop(params)
  console.log('res，', res)
};
const onDragstart = (event: { stopPropagation: () => void; }) => {
  event.stopPropagation();
};
</script>
<template>
  <div class="sidebar" @dragstart="onDragstart" :style="{ width: SideBarWidth + 'px' }">
    <el-collapse v-model="active" style="margin-top: -3px">
      <el-collapse-item title="通用" name="common">
        <div class="collapse">
          <div v-for="sidebarItem in sideBarList" :key="sidebarItem.modelId" class="collapse-item"
            @mousedown="onMousedown( sidebarItem)">
            <el-popover placement="bottom" :content="sidebarItem.showData.name" trigger="hover" width="60">
              <template #reference>
                <img :src="sidebarItem.showData.icon" />
              </template>
            </el-popover>
          </div>
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>
<style>
.sidebar {
  user-select: none;
  overflow: hidden;
  background-color: #fbfbfb;
  padding: 0 10px;
  flex-shrink: 0;
  box-sizing: border-box;
  height: 100%;
}

.collapse {
  display: flex;
  align-items: center;
}

.collapse-item {
  user-select: none;
  margin-right: 4px;
}

.collapse-item span {
  margin-left: 10px;
  vertical-align: top;
  /* 阻止原生的拖动视觉效果，拖动行为又父级代理 */
  pointer-events: none;
}

.collapse-item img {
  width: 26px;
  vertical-align: text-top;
  /* 阻止原生的拖动视觉效果，拖动行为又父级代理 */
}
</style>
