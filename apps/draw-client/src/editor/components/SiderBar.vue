<script setup lang="ts">
import { ref } from "vue";
// @ts-ignore
import { SideBarWidth, sideBarList, styleList } from '@/constants/config';
import { shapeService } from "../../util/ShapeService";
import { SideBarDropDto } from "../../types/shape.dto";
import { useProjectStore } from '../../stores/project';
import { useUiStore } from '../../stores/ui';
import { SidebarKeyItem } from "../../constants/config";
const props = defineProps();
const active = ref("common");
const projectStore = useProjectStore();
const uiStore = useUiStore();

const activeTab = ref('shape');
const selectedStyleIndex = ref(-1);

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

const onStyleClick = async (style, idx) => {
  selectedStyleIndex.value = idx;
  // 获取所有图形
  const allShapes = await shapeService.getAllShapes(projectStore.projectId);
  const shapeIds = allShapes.map(s => s.id);
  // 批量更新风格
  await shapeService.batchUpdateShapeStyle({
    projectId: projectStore.projectId,
    shapeIds,
    styleObject: {
      background: style.bgColor,
      strokeColor: style.borderColor
    }
  });
  // 可选：可加刷新逻辑
};
</script>
<template>
  <div class="sidebar" @dragstart="onDragstart" :style="{ width: SideBarWidth + 'px' }">
    <div class="sidebar-tabs">
      <span :class="{active: activeTab==='shape'}" @click="activeTab='shape'">图形库</span>
      <span :class="{active: activeTab==='style'}" @click="activeTab='style'">风格</span>
    </div>
    <div v-if="activeTab==='shape'">
      <el-collapse v-model="active" style="margin-top: -3px">
        <el-collapse-item title="通用" name="common">
          <div class="collapse">
            <div v-for="sidebarItem in sideBarList" :key="sidebarItem.modelId" class="collapse-item"
              @mousedown="onMousedown(sidebarItem)">
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
    <div v-else>
      <div class="style-list">
        <div
          v-for="(style, idx) in styleList"
          :key="style.icon"
          :class="['style-item', {selected: selectedStyleIndex===idx}]"
          @click="onStyleClick(style, idx)"
        >
          <template v-if="idx === 0">
            <span class="default-tag">默认</span>
          </template>
          <img :src="style.icon" />
        </div>
      </div>
    </div>
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

.sidebar-tabs {
  display: flex;
  border-bottom: 1px solid #eee;
  margin-bottom: 8px;
}
.sidebar-tabs span {
  flex: 1;
  text-align: center;
  padding: 8px 0;
  cursor: pointer;
}
.sidebar-tabs .active {
  font-weight: bold;
  border-bottom: 2px solid #409EFF;
}
.style-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px 0;
}
.style-item {
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 4px;
  cursor: pointer;
   flex: 1 0 calc(50% - 4px); /* 50% - (8px / 2) */
  position: relative;
  flex-grow: 0;
}
.style-item.selected {
  border-color: #409EFF;
  background: #e6f7ff;
}
.style-item img {
  width: 100%;
  height: 100%;
}
.default-tag {
  position: absolute;
  left: 4px;
  top: 4px;
  color: #409EFF;
  font-size: 12px;
  border-radius: 3px;
  padding: 0 4px;
  z-index: 2;
  font-weight: bold;
  pointer-events: none;
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
