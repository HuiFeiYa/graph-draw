/**
 * header菜单通用项
 * 主页、新建项目、打开、保存、关闭、打印、搜索、回撤、重做
 */
export const Common = [
  {
    label: "回到首页",
    notShowLabel: true,
    value: "linkToHome",
    icon: "statics/header/topiconhome.svg",
    get hide() {
      return false;
    },
  },
  {
    label: "保存项目",
    notShowLabel: true,
    value: "saveProject",
    icon: "statics/header/topiconsave.svg",
    get disabled() {
      return false;
    }
  },
  {
    label: "另存为",
    notShowLabel: true,
    value: 'saveAsProject',
    get disabled() {
      return false;
    },
    icon: "statics/header/savaAs.svg",
    get hide() {
      return false;
    }
  },
  {
    label: "保存至本地文件",
    notShowLabel: true,
    value: "saveToMd3",
    icon: "statics/header/topiconsavetomd3.svg",
    get disabled() {
      return false;
    },
    get hide() {
     return false
    }
  },
  {
    label: "创建项目",
    notShowLabel: true,
    value: "createProject",
    icon: "statics/header/topiconnew.svg"
  },
  {
    label: "打开项目",
    notShowLabel: true,
    value: "openProject",
    icon: "statics/header/topiconopen.svg"
  },
  {
    label: "撤销",
    notShowLabel: true,
    value: "undo",
    icon: "statics/header/topiconundo.svg",
    get disabled() {
      
      return false;
    }
  },
  {
    label: "重做",
    notShowLabel: true,
    value: "redo",
    icon: "statics/header/topiconredo.svg",
    get disabled() {
      return false;
    }
  },
  {
    label: '刷新',
    value: 'toolRefresh',
    notShowLabel: true,
    get disabled() {
      return false;
    },
    icon: 'statics/header/toolbarfresh.svg',
  }
]

// 项目特有的菜单
const File = [
  {
    label: "关闭",
    value: "closeProject",
    icon: "statics/header/topiconclose.svg",
    // type: 'dropdown-arrow',
    get disabled() {
      return false;
    }
  },
  {
    label: "导出",
    value: "export",
    get disabled() {
      return false;

    },
    icon: "statics/header/topiconexport.svg",
    // type: "dropdown",
  },
  {
    label: "选择",
    value: 'select',
    icon: "statics/header/arrow1.svg",
    selectStatus: true, // 是否需要选中状态
  },
  {
    label: "矩形",
    value: 'rect',
    icon: "statics/header/rect.svg",
    selectStatus: true, // 是否需要选中状态
  },
  {
    label: "菱形",
    value: 'lingxing',
    icon: "statics/header/lengxing.svg",
    selectStatus: true, // 是否需要选中状态
  },
  {
    label: "圆形",
    value: 'circle',
    icon: "statics/header/circle.svg",
    selectStatus: true, // 是否需要选中状态
  },
  {
    label: "箭头",
    value: 'long-arrow',
    icon: "statics/header/long-arrow.svg",
    selectStatus: true, // 是否需要选中状态
  },
  {
    label: "文本",
    value: 'text',
    icon: "statics/header/input-method-line.svg",
    selectStatus: true, // 是否需要选中状态
  },
]

/**
 * 帮助
 */
export const Help = [
  {
    label: "使用手册",
    value: "openDocument",
    icon: "statics/header/topiconqa.svg",
    get path() {
      return false;
    }
  },
  {
    label: "关于",
    value: "about",
    get disabled() {
      return false;
    },
    get showTip() {
      return false;
    },
    icon: "statics/header/topiconabout.svg"
  }
]
export const headerMenus = [
    {
      cnName: "项目",
      enName: "Project",
      get disabled() {
        return false;
      },
      get hide() {
        return false;
      },
      children: concatChildren(Common, File)
    },
    {
      cnName: "帮助",
      enName: "Help",
      children: concatChildren(Common, Help),
      get disabled() {
        return false;
      },
      get hide() {
        return false;
      },
    }
]



function concatChildren(...args) {
  const res:Object[] = [];
  args.forEach(arg => {
    arg.forEach(children => {
      // 获取快捷键（不监听，只进行tips的显示）
      res.push(children);
    });
    // 添加竖直分割线,用type
    res.push({
      value: "splitLine",
      icon: "",
      label: "",
      type: "splitLine"
    });
  });
  res.pop();
  return res;
}