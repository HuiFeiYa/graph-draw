import { electronMock } from './mocks/electron';

// 在测试环境注入 window.electron，避免组件访问 undefined
// 测试用例可覆盖为自定义的 mock
// @ts-ignore
if (typeof window !== 'undefined') {
  // 只在未定义时注入，避免被具体测试替换后的值被覆盖
  // @ts-ignore
  if (!(window as any).electron) {
    (window as any).electron = electronMock;
  }
}

// 规避 workspace 包的重量级依赖，提供轻量 mock，便于组件与 store 初始化
vi.mock('@hfdraw/graph', () => {
  class SelectionModel {
    selectedShapes: any[] = []
  }
  class GraphModel {
    selectionModel: SelectionModel
    constructor() {
      this.selectionModel = new SelectionModel();
    }
  }
  class GraphOption {
    constructor(public id: string) {}
  }
  return { GraphModel, GraphOption };
});

// Element-Plus 相关：多数测试按需在 mount 时注入插件，不在全局 setup 注册，避免污染