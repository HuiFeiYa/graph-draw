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
      if (app.activeProject?.config.online) {
        return true;
      }
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
    icon: 'statics/icons/table/toolbarfresh.svg',
  }
]

function concatChildren(...args) {
    const res = [];
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
export const headerMenus = [
    {
      cnName: "project",
      enName: "Project",
      get disabled() {
        return !app.isAppActive;
      },
      get hide() {
        return false;
      },
      children: concatChildren(Common, [])
    }
]