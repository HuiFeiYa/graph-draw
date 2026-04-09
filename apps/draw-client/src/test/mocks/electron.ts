// 简单的 Electron 预加载暴露对象的模拟
// 提供窗口控制方法的空实现，便于组件测试覆盖交互调用
export function createElectronMock() {
  return {
    openFileDialog: vi.fn(async () => []),
    openDevTools: vi.fn(() => {}),
    closeProject: vi.fn(async () => {}),
    minimize: vi.fn(async () => {}),
    maximize: vi.fn(async () => {}),
    unmaximize: vi.fn(async () => {}),
    closeWindow: vi.fn(async () => {}),
  } as const;
}

// 默认导出一个单例，测试可按需替换为新的 mock
export const electronMock = createElectronMock();