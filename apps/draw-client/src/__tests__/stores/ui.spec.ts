import { describe, it, expect } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useUiStore } from '@/stores/ui';

describe('stores/ui', () => {
  it('getNextDropPosition cycles with offset and resets correctly', () => {
    setActivePinia(createPinia());
    const store = useUiStore();
    const positions = [] as { x: number; y: number }[];
    for (let i = 0; i < 3; i++) {
      positions.push(store.getNextDropPosition());
    }
    expect(positions[0]).toEqual({ x: 100, y: 100 });
    expect(positions[1]).toEqual({ x: 120, y: 120 });
    expect(positions[2]).toEqual({ x: 140, y: 140 });

    store.resetDropPosition();
    expect(store.dropOffsetCount).toBe(0);
    expect(store.dropPosition).toEqual({ x: 100, y: 100 });
  });

  it('setPopoverDirection updates direction', () => {
    setActivePinia(createPinia());
    const store = useUiStore();
    store.setPopoverDirection('left');
    expect(store.popoverDirection).toBe('left');
  });
});