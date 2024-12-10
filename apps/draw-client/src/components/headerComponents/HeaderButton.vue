<template>
  <div v-show="!data.hide" class="v-header-btn g-pointer g-pd-4 g-flex" :class="{ 'g-disabled': data.disabled,'selected': isSelected }">
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
  selectButtonValue?: string
}>();
const isSelected = computed(()=> {
  return props.selectButtonValue === props.data.value;
})
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
.v-header-btn.selected {
    background-color: #0000ff30;
  }
</style>
