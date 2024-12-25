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
        <m-header-button v-if="!child.type" :selectButtonValue="selectButtonValue" :data="child" @click="handleClick(child)" />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue';
import { headerMenus } from './menuItem/index'
import MHeaderSplitLine from './headerComponents/HeaderSplitLine.vue';
// @ts-ignore
import MHeaderButton from './headerComponents/HeaderButton.vue';
import { shapeService } from '../util/ShapeService';
let activeTab = ref('Project');
let selectButtonValue = ref('');
const activeHeaderMenu = computed(() => {
  return headerMenus.find(it => it.enName === activeTab.value);
});
console.log('activeHeaderMenu:', activeHeaderMenu)

function onClickHeader(headerMenu: { disabled: any; enName: string; }) {
  if (headerMenu.disabled) return;
  activeTab.value = headerMenu.enName;
}
async function handleClick(child: { selectStatus: any; value: string; }) {
  if (child.selectStatus) {
    selectButtonValue.value = child.value
  } else {
    selectButtonValue.value = ''
  }
  switch(child.value) {
    case 'undo': {
      await shapeService.undo('p1')
      break;
    }
    case 'redo': {
      await shapeService.redo('p1');
      break;
    }
  }
}
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
