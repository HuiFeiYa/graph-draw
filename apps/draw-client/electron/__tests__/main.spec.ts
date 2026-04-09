// @vitest-environment node
import { describe, it, beforeEach, expect, vi } from 'vitest';

// 使用工厂内部定义，避免 vi.mock 提前执行导致的 TDZ 问题
vi.mock('electron', () => {
  const handlers = new Map<string, (...args: any[]) => any>();
  const listeners = new Map<string, (...args: any[]) => any>();
  (globalThis as any).__handlers = handlers;
  (globalThis as any).__listeners = listeners;
  class MockBrowserWindow {
    minimize = vi.fn();
    maximize = vi.fn();
    unmaximize = vi.fn();
    close = vi.fn();
    loadURL = vi.fn();
    webContents = { openDevTools: vi.fn() };
    constructor(_: any) {}
  }
  return {
    ipcMain: {
      handle: (channel: string, fn: (...args: any[]) => any) => handlers.set(channel, fn),
      on: (channel: string, fn: (...args: any[]) => any) => listeners.set(channel, fn),
    },
    dialog: {
      showOpenDialog: vi.fn().mockResolvedValue({ canceled: false, filePaths: ['C:/mock.draw'] }),
    },
    Menu: { setApplicationMenu: vi.fn() },
    app: {
      getAppPath: vi.fn(() => 'D:/mock/appPath'),
      getPath: vi.fn(() => 'D:/mock/userData'),
      quit: vi.fn(),
    },
    BrowserWindow: MockBrowserWindow,
  };
});

// 避免 AppInstance 内部 require('./Logger') 在测试环境解析 TS 报错
vi.mock('D:/sourcecode/draw/hfdraw/apps/draw-client/electron/Logger.ts', () => {
  return {
    default: class LoggerMock {
      async info() {}
      async error() {}
    }
  };
});

// 将环境固定为 development，避免 Logger 写磁盘
const prevNodeEnv = process.env.NODE_ENV;
process.env.NODE_ENV = 'development';

// 以 ESM 方式导入（AppInstance 使用 CJS 导出，默认导入可获得类）
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import AppInstance from '../AppInstance.ts';

// 通过 globalThis 访问注册的 handlers/listeners
const handlers = (globalThis as any).__handlers as Map<string, (...args: any[]) => any>;
const listeners = (globalThis as any).__listeners as Map<string, (...args: any[]) => any>;

describe('electron main process (AppInstance)', () => {
  beforeEach(() => {
    handlers.clear();
    listeners.clear();
    vi.clearAllMocks();
  });

  it('注册窗口控制 IPC 并触发相应方法', async () => {
    const appInstance = new AppInstance();
    // 直接注入窗口实例，避免构造真实 BrowserWindow
    appInstance.mainWindow = {
      minimize: vi.fn(),
      maximize: vi.fn(),
      unmaximize: vi.fn(),
      close: vi.fn(),
      webContents: { openDevTools: vi.fn() },
    };
    appInstance.setupIPC();

    await handlers.get('window-minimize')?.();
    await handlers.get('window-maximize')?.();
    await handlers.get('window-unmaximize')?.();

    expect(appInstance.mainWindow.minimize).toHaveBeenCalledTimes(1);
    expect(appInstance.mainWindow.maximize).toHaveBeenCalledTimes(1);
    expect(appInstance.mainWindow.unmaximize).toHaveBeenCalledTimes(1);
  });

  it('open-dev-tools 事件调用 webContents.openDevTools', async () => {
    const appInstance = new AppInstance();
    appInstance.mainWindow = { webContents: { openDevTools: vi.fn() } };
    appInstance.setupIPC();

    listeners.get('open-dev-tools')?.();
    expect(appInstance.mainWindow.webContents.openDevTools).toHaveBeenCalledTimes(1);
  });

  it('打开文件对话框返回首个路径', async () => {
    const appInstance = new AppInstance();
    appInstance.setupIPC();

    const p = await handlers.get('open-file-dialog')?.({});
    expect(p).toBe('C:/mock.draw');
  });

  it('window-close 关闭窗口并尝试杀死子进程', async () => {
    const appInstance = new AppInstance();
    appInstance.mainWindow = { close: vi.fn(), webContents: { openDevTools: vi.fn() } };
    appInstance.nodeServerProcess = { kill: vi.fn() };
    appInstance.setupIPC();

    await handlers.get('window-close')?.();
    expect(appInstance.mainWindow.close).toHaveBeenCalledTimes(1);
    expect(appInstance.nodeServerProcess.kill).toHaveBeenCalledTimes(1);
  });
});

// 还原环境变量
process.env.NODE_ENV = prevNodeEnv;