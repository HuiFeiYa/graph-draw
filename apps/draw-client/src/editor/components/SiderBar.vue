<script setup lang="ts">
import { ref } from "vue";
import { SideBarWidth, siderBarList } from '@/constants/config';
import { shapeService } from "../../util/ShapeService";
import { SideBarDropDto } from "../../types/shape.dto";
import { SiderbarItemKey } from "@hfdraw/types";
const props = defineProps();
const active = ref("common");

const onMousedown = async (event, item) => {
  const params:SideBarDropDto = {
    diagramId: '1',
    point: {x: 100, y: 100},
    projectId: 'p1',
    sourceType: SiderbarItemKey.Block
  }
  const res = shapeService.sidebarDrop(params)
  console.log('res，', res)
};
const onDragstart = (event) => {
  event.stopPropagation();
};
</script>
<template>
  <div class="sidebar" @dragstart="onDragstart" :style="{ width: SideBarWidth + 'px' }">
    <el-collapse v-model="active" style="margin-top: -3px">
      <el-collapse-item title="通用" name="common">
        <div class="collapse">
          <div v-for="siderbarItem in siderBarList" :key="siderbarItem.modelId" class="collapse-item"
            @mousedown="onMousedown($event, siderbarItem)">
            <el-popover placement="bottom" :content="siderbarItem.showData.name" trigger="hover" width="60">
              <template #reference>
                <img :src="siderbarItem.showData.icon" />
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
