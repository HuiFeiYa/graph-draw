<template>
  <el-drawer
    :model-value="visible"
    @update:model-value="val => emit('update:visible', val)"
    title="页面设置"
    direction="rtl"
    size="360px"
    :with-header="true"
    append-to-body
  >
    <div style="padding: 16px;">
      <el-form label-width="80px">
        <el-form-item label="页面宽度">
          <el-input-number v-model="localWidth" :min="500" :max="10000" :step="10" />
          <span style="margin-left: 8px;">px</span>
        </el-form-item>
        <el-form-item label="页面高度">
          <el-input-number v-model="localHeight" :min="500" :max="10000" :step="10" />
          <span style="margin-left: 8px;">px</span>
        </el-form-item>
        <el-form-item label="显示水印">
          <el-switch v-model="localShowWatermark" />
        </el-form-item>
        <el-form-item label="水印内容">
          <el-input
            v-model="localWatermarkText"
            :maxlength="15"
            placeholder="不超过15个字"
            @input="handleWatermarkInput"
          />
        </el-form-item>
      </el-form>
      <div style="text-align: right; margin-top: 24px;">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleConfirm">应用</el-button>
      </div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits } from 'vue';
import { ElMessage } from 'element-plus';

const props = defineProps({
  visible: Boolean,
  width: { type: Number, default: 1100 },
  height: { type: Number, default: 900 },

  showWatermark: { type: Boolean, default: true },
  watermarkText: { type: String, default: 'HfDraw@会飞' }
});
const emit = defineEmits(['update:visible', 'confirm', 'cancel']);

const localWidth = ref(props.width);
const localHeight = ref(props.height);
const localShowWatermark = ref(props.showWatermark);
const localWatermarkText = ref(props.watermarkText);

watch(() => props.visible, (val) => {
  if (val) {
    localWidth.value = props.width;
    localHeight.value = props.height;
    localShowWatermark.value = props.showWatermark;
    localWatermarkText.value = props.watermarkText;
  }
});

function handleCancel() {
  emit('update:visible', false);
  emit('cancel');
}

function handleConfirm() {
  if (localWidth.value < 500 || localWidth.value > 10000 || localHeight.value < 500 || localHeight.value > 10000) {
    ElMessage.error('宽高范围为500~10000px');
    return;
  }
  emit('confirm', {
    width: localWidth.value,
    height: localHeight.value,
    isShowWatermark: localShowWatermark.value,
    text: localWatermarkText.value
  });
  emit('update:visible', false);
}

function handleWatermarkInput(val: string) {
  if (val.length > 15) {
    localWatermarkText.value = val.slice(0, 15);
    ElMessage.warning('水印内容最多15字');
  } else {
    localWatermarkText.value = val;
  }
}
</script> 