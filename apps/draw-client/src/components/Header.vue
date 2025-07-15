<template>
  <div class="v-header">
    <div class="_header-top">
      <div class="g-flex">
        <span v-for="item in headerMenus.filter(it => !it.hide)" :key="item.enName" class="_header-menu"
          :class="{ disabled: item.disabled, 'is-active': item.enName === activeTab }" @click="onClickHeader(item)">
          <span class="custom-tabs-label">
            <span>
              {{ item.cnName + '(' + item.enName[0] + ')' }}
              <span v-if="item.children.some(child => child.showTip)" class="g-tip"></span>
            </span>
          </span>
        </span>
      </div>
    </div>
    <div class="_header-content">
      <div v-for="child in (activeHeaderMenu?.children || [])"
        :key="child.value" :class="{ _select: child.type == 'select', _item: child.type !== 'splitLine' }">
        <m-header-split-line v-if="child.type == 'splitLine'" />
        <!-- 展示按钮，对应 menuItem/index.ts  File 这一层的配置项 -->
        <m-header-button v-if="!child.type"  :data="child" @click="handleClick(child)" />
        <!-- 下拉  -->
        <m-header-dropdown
          v-else-if="child.type == 'dropdown'"
          :data="child"
          @item-click="handleDropdownItemClick"
        />
        <m-header-button
          v-else-if="child.type === 'toggle'"
          :data="child"
          :selected="getSelect(child.value)"
          @click="handleClick(child)"
        />
        <!-- 字体颜色 -->
        <div v-else-if="child.type === 'fontColor'" style="display: flex;align-items: center;">
          <img :style="[child.disabled ? {opacity: 0.5, cursor: 'not-allowed'} : {}]" :src="child.icon" alt="" style="width: 18px;height: 18px;">
          <el-color-picker
            size="small"
            :disabled="child.disabled"
            :model-value="getSelect(child.value)"
            @change="handleFontColorChange"
            show-alpha
          />
        </div>
      </div>
    </div>
    <el-dialog v-model="exportDialogVisible" title="导出模板" width="300px" center  >
      <el-input v-model="templateName" placeholder="请输入模板名称" />
      <template #footer>
        <el-button @click="exportDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleExportTemplate">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { headerMenus } from './menuItem/index'
import MHeaderSplitLine from './headerComponents/HeaderSplitLine.vue';
import MHeaderButton from './headerComponents/HeaderButton.vue';
import MHeaderDropdown from './headerComponents/HeaderDropdown.vue'
import { shapeService } from '../util/ShapeService';
import { projectService } from '../util/ProjectService';
import { stepStatusReactive } from '../util/StepStatus';
import { useUiStore } from '../stores/ui';
import { emitter } from '../util/Emitter';
import { BusEvent } from '../constants/config';
import { useProjectStore } from '../stores/project';
import { ElDialog, ElInput, ElButton, ElMessage } from 'element-plus'
import { modelService } from '../util/ModelService';
import { StyleObject } from '@hfdraw/types';

const projectStore = useProjectStore();
const router = useRouter();
let activeTab = ref('Project');
const uiStore = useUiStore();
const exportDialogVisible = ref(false)
const templateName = ref('')
const activeHeaderMenu = computed(() => {
  return headerMenus.find(it => it.enName === activeTab.value);
});
function onClickHeader(headerMenu: { disabled: boolean; enName: string; }) {
  if (headerMenu.disabled) return;
  activeTab.value = headerMenu.enName;
}
async function handleDropdownItemClick(item: { value: any }, key: string) {
  // 判断 lineHeight/textAlign 枚举
  if (key === 'lineHeight' ) {
    const shapeIds = uiStore.graphData.graph.selectionModel.selectedShapes.map(s => s.id);
    if (!shapeIds.length) return;
    let styleObject = {
      lineHeight: item.value
    };
   
    await shapeService.batchUpdateShapeStyle({
      projectId: projectStore.projectId,
      shapeIds,
      styleObject
    });
    // 本地同步 style
    shapeIds.forEach(id => {
      const shape = uiStore.graphData.graph.symbols.find(s => s.id === id);
      if (shape) Object.assign(shape.style, styleObject);
    });
    return;
  } else if (item.value === 'exportTemplate') {
    exportDialogVisible.value = true
    templateName.value = ''
    return
  }
  emitter.emit(BusEvent.DROPDOWN_ITEM_CLICK, item)
}
async function handleExportTemplate() {
  if (!templateName.value) {
    ElMessage.warning('请输入模板名称')
    return
  }
  await modelService.exportTemplate({
    projectId: projectStore.projectId,
    name: templateName.value
  })
  ElMessage.success('导出模板成功')
  exportDialogVisible.value = false
}
async function handleClick(child: { selectStatus: any; value: string; disabled: boolean}) {
  if (child.disabled) return;
  switch(child.value) {
    case 'openDevTools': {
      console.log('openDevTools menu')
      window.electron.openDevTools();
      break;
    }
    case 'undo': {
      await shapeService.undo(projectStore.projectId)
      break;
    }
    case 'redo': {
      await shapeService.redo(projectStore.projectId);
      break;
    }
    case 'clear': {
      await shapeService.clear(projectStore.projectId)
      emitter.emit(BusEvent.REFRESH)
      clear()
      break;
    }
    case 'saveProject': {
      await projectService.saveProject(projectStore.projectId)
      break;
    }
    case 'linkToHome': {
      router.push('/layout/project-list');
      break;
    }
    case 'openProject': {
      try {
        const filePath = await window.electron.openFileDialog();
        if (filePath) {
          const data = await projectService.openProject(filePath);
          if (data) {
            freshStepStatus();
          }
        }
      } catch (error) {
        console.error('Failed to open project:', error);
      }
      break;
    }
    case 'bold': {
      const selectedShapes = uiStore.graphData.graph.selectionModel.selectedShapes;
      const currentStyle = selectedShapes[0].style;
      const shapeIds = uiStore.graphData.graph.selectionModel.selectedShapes.map(it => it.id);
      // 假设你有 projectId、shapeIds、newStyle
      await shapeService.batchUpdateShapeStyle({
        projectId: projectStore.projectId,
        shapeIds,
        styleObject: {
          bold: !currentStyle.bold
        }
      });
      break;
    }
     case 'italic': {
      const selectedShapes = uiStore.graphData.graph.selectionModel.selectedShapes;
      const currentStyle = selectedShapes[0].style;
      const shapeIds = selectedShapes.map(it => it.id);
      await shapeService.batchUpdateShapeStyle({
        projectId: projectStore.projectId,
        shapeIds,
        styleObject: {
          italic: !currentStyle.italic
        }
      });
      break;
     }
     case 'underline': {
      const selectedShapes = uiStore.graphData.graph.selectionModel.selectedShapes;
      const currentStyle = selectedShapes[0].style;
      const shapeIds = uiStore.graphData.graph.selectionModel.selectedShapes.map(it => it.id);
      await shapeService.batchUpdateShapeStyle({
        projectId: projectStore.projectId,
        shapeIds,
        styleObject: {
          underline: !currentStyle.underline
        }
      });
      break;
     }
  }
}
async function handleFontColorChange(color: string) {
  const shapeIds = uiStore.graphData.graph.selectionModel.selectedShapes.map(s => s.id);
  if (!shapeIds.length) return;
  await shapeService.batchUpdateShapeStyle({
    projectId: projectStore.projectId,
    shapeIds,
    styleObject: { fontColor: color }
  });
}
function clear() {
  uiStore.clearPopoverList();
  emitter.emit(BusEvent.CLEAR_STATUS)
}
function freshStepStatus(projectId?: string) {
  if (projectStore.projectId || projectId) {
    stepStatusReactive.fresh(projectStore.projectId)
  }
}

function getSelect( value: string) {
  const firstSelectedShape = uiStore.graphData?.graph?.selectionModel?.selectedShapes[0];
  if (firstSelectedShape) {
    const key = value  as keyof StyleObject;
    return firstSelectedShape.style[key];
  }
  return false;
}
watch(() => projectStore.projectId, (newVal) => {
  console.log('projectId:',newVal)
  freshStepStatus(newVal)
})
onMounted(()=> {
  freshStepStatus()
})
</script>
<style lang="scss">
@use '@/assets/css/theme' as *;

.v-header {
  position: relative;
  border-bottom: 1px solid #C4C1C2;
  overflow: hidden;

  ._header-top {
    height: 24px;
    background-color: $frame-title-bg-color;
    padding-left: 9px;
    display: flex;
    justify-content: space-between;
    overflow: hidden;

    ._header-menu {
      height: 24px;
      padding: 4px 12px;
      line-height: 16px;
      text-align: center;
      font-size: 12px;
      color: #ffffff;
      min-width: 66px;
      cursor: pointer;

      &.disabled {
        color: #90A8CF;
      }

      &.is-active {
        color: rgba(0, 0, 0, 0.85);
        background-color: $toolbar-bg-color;
        font-weight: 550;
      }
    }
  }

  ._header-content {
    height: 36px;
    background-color: $toolbar-bg-color;
    padding: 0px 8px;
    display: flex;
    overflow: hidden;

    ._item {
      position: relative;
      border: 1px solid rgba(0, 0, 0, 0);
      margin-top: 6px;
      height: 26px;

      &._select {
        margin-top: 3px;
        height: 32px;

      }

      color: #5f6c88;
      font-size: 11px;

      &:hover {
        background-color: $item-active-bg-color;
        box-shadow: 0px 9px 28px 8px rgba(0, 0, 0, 0.05),
          0px 6px 16px 0px rgba(0, 0, 0, 0.08),
          0px 3px 6px -4px rgba(0, 0, 0, 0.12);
        border: 1px solid #e0e0e0;
      }
    }
  }

}
</style>
