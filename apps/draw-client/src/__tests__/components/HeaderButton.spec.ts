import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import HeaderButton from '@/components/headerComponents/HeaderButton.vue';
import ElementPlus from 'element-plus';

const baseData = {
  value: 'test',
  icon: '/icon.svg',
  label: '测试按钮',
};

describe('components/HeaderButton', () => {
  it('renders label and icon', () => {
    const wrapper = mount(HeaderButton, {
      props: { data: baseData },
      global: { plugins: [ElementPlus] },
    });
    expect(wrapper.find('.btn_text').text()).toContain('测试按钮');
    expect(wrapper.find('.icon_box').exists()).toBe(true);
  });

  it('applies active class when selected', () => {
    const wrapper = mount(HeaderButton, {
      props: { data: baseData, selected: true },
      global: { plugins: [ElementPlus] },
    });
    expect(wrapper.find('.v-header-btn').classes()).toContain('active');
  });

  it('applies disabled class when data.disabled', () => {
    const wrapper = mount(HeaderButton, {
      props: { data: { ...baseData, disabled: true } },
      global: { plugins: [ElementPlus] },
    });
    expect(wrapper.find('.v-header-btn').classes()).toContain('disabled');
  });

  it('v-show hides when data.hide is true', async () => {
    const wrapper = mount(HeaderButton, {
      props: { data: { ...baseData, hide: true } },
      global: { plugins: [ElementPlus] },
    });
    const style = wrapper.find('.v-header-btn').attributes('style') || '';
    expect(style.includes('display: none')).toBe(true);
  });
});