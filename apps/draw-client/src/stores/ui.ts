// src/stores/uiStore.ts
import { defineStore } from 'pinia';
import { PopoverListItem } from '../types/ui';

interface UiState {
    popoverList: PopoverListItem[];
    dropPosition: { x: number; y: number };
    dropOffsetCount: number;
}

export const useUiStore = defineStore('ui', {
  state: ():UiState  => ({
    popoverList: [],
    dropPosition: { x: 100, y: 100 },
    dropOffsetCount: 0
  }),
  actions: {
    setPopoverList(list:PopoverListItem[]) {
        this.popoverList = list;
    },
    clearPopoverList() {
      this.popoverList = []
    },
    getNextDropPosition() {
      const offset = 20; // 每次偏移20像素
      const maxOffsets = 10; // 最大偏移10次
      
      // 计算当前位置
      const currentPosition = {
        x: 100 + (this.dropOffsetCount * offset),
        y: 100 + (this.dropOffsetCount * offset)
      };
      
      // 更新偏移计数器
      this.dropOffsetCount = (this.dropOffsetCount + 1) % (maxOffsets + 1);
      
      // 更新存储的位置
      this.dropPosition = currentPosition;
      
      return currentPosition;
    },
    resetDropPosition() {
      this.dropPosition = { x: 100, y: 100 };
      this.dropOffsetCount = 0;
    }
  }
});