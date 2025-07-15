<template>
  <div v-show="!data.hide" class="v-header-btn g-pointer g-pd-4 g-flex"  
  :class="{ disabled: data.disabled, active: selected }">
    <el-tooltip
      :show-after="500"
      placement="bottom"
      :content="data.label + (data.keyboard ? `(${data.keyboard})` : '')"
    >
      <span class="g-one-line btn-wrapper" >
        <span class="icon_box" :style="{backgroundImage: `url(${data.icon})`}">
        </span>
        <span v-if="!data.notShowLabel" class="g-m-l-4 g-lh-18 btn_text" style="position: relative">
          {{data.label}}
          <span v-if="data.showTip" class="g-tip"></span>
        </span>
      </span>
    </el-tooltip>
  </div>
</template>
<script lang="ts" setup>
import { computed } from 'vue';

const props = defineProps<{
  data: {
    value: string
    icon: string
    label: string
    notShowLabel?: boolean
    disabled?: boolean
    showTip?: boolean
    hide?: boolean
    type?: string
    keyboard?: string
  },
  selected?: boolean
}>();
</script>
<style lang="scss" scoped>
.v-header-btn {
  height: 24px;
  .btn-wrapper {
    display: flex;
    align-items: center;

    .icon_box {
      width: 16px;
      height: 16px;
      background-repeat: no-repeat;
      background-position: center;
      background-size: 100%;
    }
  }
 
}
.v-header-btn.disabled  {
  filter: grayscale(85%) !important;
  color: #c1c5cb !important;
  cursor: not-allowed !important;
}
.v-header-btn.active {
    background: #d0eaff;
    color: #1976d2;
  }
.v-header-btn.disabled .icon_box {
  filter: grayscale(85%) brightness(1.2) !important;
  opacity: 0.4;
}
</style>
