<template>
  <div class="footer">
    <div class="zoom-controls">
      <button @click="zoomOut" class="zoom-btn" :disabled="scale <= 0.1">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3 8h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </button>
      
      <div class="zoom-slider-container">
        <input 
          type="range" 
          class="zoom-slider"
          :value="scale"
          min="0.1"
          max="5"
          step="0.1"
          @input="onSliderChange"
        />
        <span class="zoom-display">{{ Math.round(scale * 100) }}%</span>
      </div>
      
      <button @click="zoomIn" class="zoom-btn" :disabled="scale >= 5">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  scale: number;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  zoomIn: [];
  zoomOut: [];
  scaleChange: [scale: number];
}>();

const scale = computed(() => props.scale);

function zoomIn() {
  emit('zoomIn');
}

function zoomOut() {
  emit('zoomOut');
}

function onSliderChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const newScale = parseFloat(target.value);
  emit('scaleChange', newScale);
}
</script>

<style lang="scss" scoped>
.footer {
  height: 40px;
  background-color: white;
  border-top: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  z-index: 1000;
}

.zoom-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.zoom-btn {
  border: none;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #666;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background-color: #f8f9fa;
    border-color: #999;
    color: #333;
  }

  &:active:not(:disabled) {
    background-color: #e9ecef;
    transform: scale(0.95);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    color: #ccc;
  }
}

.zoom-slider-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.zoom-slider {
  width: 120px;
  height: 4px;
  background: #e0e0e0;
  border-radius: 2px;
  outline: none;
  cursor: pointer;
  
  &::-webkit-slider-thumb {
    appearance: none;
    width: 16px;
    height: 16px;
    background: #007bff;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
      background: #0056b3;
      transform: scale(1.1);
    }
  }
  
  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    background: #007bff;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
      background: #0056b3;
      transform: scale(1.1);
    }
  }
}

.zoom-display {
  min-width: 50px;
  text-align: center;
  font-size: 13px;
  color: #666;
  font-weight: 500;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}
</style>