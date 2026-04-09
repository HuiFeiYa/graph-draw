import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import WindowBar from '@/components/WindowBar.vue';
import { createPinia } from 'pinia';
import { useProjectStore } from '@/stores/project';
import { createElectronMock } from '@/test/mocks/electron';

// 通过变量控制 useRoute 返回的 path
let currentPath = '/layout/flow';
vi.mock('vue-router', async () => {
  const actual = await vi.importActual<any>('vue-router');
  return {
    ...actual,
    useRoute: () => ({ path: currentPath }),
  };
});

describe('components/WindowBar (Electron)', () => {
  beforeEach(() => {
    // 注入独立的 electron mock，便于断言调用次数
    (window as any).electron = createElectronMock();
  });

  it('shows projectName only on /flow route', async () => {
    const pinia = createPinia();
    const wrapper = mount(WindowBar, {
      global: { plugins: [pinia] },
    });
    const store = useProjectStore();
    store.setCurrentProjectName('Project Alpha');
    await wrapper.vm.$nextTick();
    expect(wrapper.find('._text._rls').text()).toContain('Project Alpha');

    // 切换为非 flow 路由
    currentPath = '/layout/project-list';
    const wrapper2 = mount(WindowBar, { global: { plugins: [pinia] } });
    await wrapper2.vm.$nextTick();
    expect(wrapper2.find('._text._rls').exists()).toBe(false);
  });

  it('minimize/maximize/unmaximize and close buttons call electron APIs', async () => {
    const pinia = createPinia();
    const wrapper = mount(WindowBar, {
      global: { plugins: [pinia] },
    });
    const electron = (window as any).electron;
    const minBtn = wrapper.find('._min-btn');
    const maxBtn = wrapper.find('._max-btn');
    const closeBtn = wrapper.find('._close-btn');

    await minBtn.trigger('click');
    expect(electron.minimize).toHaveBeenCalledTimes(1);

    await maxBtn.trigger('click'); // 设置为 max
    expect(electron.maximize).toHaveBeenCalledTimes(1);
    await maxBtn.trigger('click'); // 再次点击切回 mid
    expect(electron.unmaximize).toHaveBeenCalledTimes(1);

    await closeBtn.trigger('click');
    expect(electron.closeWindow).toHaveBeenCalledTimes(1);
  });
});