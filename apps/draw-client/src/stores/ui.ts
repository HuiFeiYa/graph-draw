// src/stores/uiStore.ts
import { defineStore } from 'pinia';
import { PopoverListItem } from '../types/ui';

interface UiState {
    popoverList: PopoverListItem[]
}

export const useUiStore = defineStore('ui', {
  state: ():UiState  => ({
    popoverList: []
  }),
  actions: {
    setPopoverList(list:PopoverListItem[]) {
        this.popoverList = list;
    }
  },
});