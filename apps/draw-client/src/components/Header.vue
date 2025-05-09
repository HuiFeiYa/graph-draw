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
        <m-header-button v-if="!child.type" :selectButtonValue="selectButtonValue" :data="child" @click="handleClick(child)" />
        <!-- 下拉  -->
        <m-header-dropdown
          v-else-if="child.type == 'dropdown'"
          :data="child"
          @item-click="handleDropdownItemClick"
        />
      </div>
    </div>
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
const projectStore = useProjectStore();
const router = useRouter();
let activeTab = ref('Project');
let selectButtonValue = ref('');
const uiStore = useUiStore();
const activeHeaderMenu = computed(() => {
  return headerMenus.find(it => it.enName === activeTab.value);
});
// console.log('activeHeaderMenu:', activeHeaderMenu)

function onClickHeader(headerMenu: { disabled: boolean; enName: string; }) {
  if (headerMenu.disabled) return;
  activeTab.value = headerMenu.enName;
}
async function handleDropdownItemClick(item) {
  console.log('item:', item)
  emitter.emit(BusEvent.DROPDOWN_ITEM_CLICK, item)
}
async function handleClick(child: { selectStatus: any; value: string; disabled: boolean}) {
  if (child.disabled) return;
  if (child.selectStatus) {
    selectButtonValue.value = child.value
  } else {
    selectButtonValue.value = ''
  }
  switch(child.value) {
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
  }
  clear()
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
