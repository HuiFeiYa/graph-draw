import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import Popver from '@/components/Popver.vue';
import { createPinia, setActivePinia } from 'pinia';
import { useUiStore } from '@/stores/ui';
import { useProjectStore } from '@/stores/project';
import { shapeService } from '@/util/ShapeService';
import { emitter } from '@/util/Emitter';
import { BusEvent } from '@/constants/config';

const mockShape = { id: 'shape-1' } as any;
const mockListItem = {
  sidebarKey: 'SysML::Blocks::Block',
  showData: { name: '矩形', icon: 'statics/siderBar/rect.png' },
};

describe('components/Popver', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.restoreAllMocks();
  });

  it('handleCreate calls connectShapeAndCreate with left direction', async () => {
    const ui = useUiStore();
    const project = useProjectStore();
    ui.setPopoverDirection('left');
    project.setCurrentProjectId('pid-1');

    const spy = vi.spyOn(shapeService, 'connectShapeAndCreate').mockResolvedValueOnce();
    const emitSpy = vi.spyOn(emitter, 'emit');

    const wrapper = mount(Popver, {
      props: {
        type: 'vertical',
        x: 10,
        y: 20,
        list: [mockListItem as any],
        index: 1 as any,
        shape: mockShape,
      },
    });

    // 点击创建
    await wrapper.find('img').trigger('click');

    expect(spy).toHaveBeenCalledTimes(1);
    const args = spy.mock.calls[0][0];
    expect(args.projectId).toBe('pid-1');
    expect(args.sourceShapeId).toBe('shape-1');
    expect(args.sourceConnection).toEqual([0, 0.5]);
    expect(args.targetConnection).toEqual([1, 0.5]);
    // 清理通知 flow 页面（测试环境 window.event 可能为 undefined）
    expect(emitSpy).toHaveBeenCalledWith(BusEvent.MOUSE_DOWN_OUT, undefined, undefined);
  });

  it('listens CLEAR_HOVER_SHAPE and clears popover list', async () => {
    const ui = useUiStore();
    const clearSpy = vi.spyOn(ui, 'clearPopoverList');
    mount(Popver, {
      props: {
        type: 'vertical',
        x: 0,
        y: 0,
        list: [mockListItem as any],
        index: 1 as any,
        shape: mockShape,
      },
    });

    emitter.emit(BusEvent.CLEAR_HOVER_SHAPE);
    expect(clearSpy).toHaveBeenCalledTimes(1);
  });
});