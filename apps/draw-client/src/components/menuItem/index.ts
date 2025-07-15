import { useUiStore } from "../../stores/ui";
import { HeadItem, MenuItem } from "../../types/common";
import { HeaderDropdownEnum } from "../../types/enum";
import { stepStatusReactive } from "../../util/StepStatus";
const uiStore = useUiStore();
export class HeaderButtonData implements MenuItem {
  value!: string
  icon!: string
  label!: string
  notShowLabel?: boolean
  disabled?: boolean
  showTip?: boolean
  hide?: boolean
  type?: string
  keyboard?: string
}
export class HeaderDropdownData extends HeaderButtonData {
  declare type: 'dropdown'
  command!: (menu: MenuItem) => void
  list!: {label: string, value: any, icon?: string}[]
  maxWidth?: number
}

/**
 * header菜单通用项
 * 主页、新建项目、打开、保存、关闭、打印、搜索、回撤、重做
 */
export const Common: HeadItem[] = [
  {
    label: "回到首页",
    notShowLabel: true,
    value: "linkToHome",
    icon: "statics/header/topiconhome.svg",
    get hide() {
      return false;
    },
  },
  // {
  //   label: "保存项目",
  //   notShowLabel: true,
  //   value: "saveProject",
  //   icon: "statics/header/topiconsave.svg",
  //   get disabled() {
  //     return false;
  //   }
  // },
  // {
  //   label: "另存为",
  //   notShowLabel: true,
  //   value: 'saveAsProject',
  //   get disabled() {
  //     return false;
  //   },
  //   icon: "statics/header/savaAs.svg",
  //   get hide() {
  //     return false;
  //   }
  // },
  // {
  //   label: "保存至本地文件",
  //   notShowLabel: true,
  //   value: "saveToMd3",
  //   icon: "statics/header/topiconsavetomd3.svg",
  //   get disabled() {
  //     return false;
  //   },
  //   get hide() {
  //    return false
  //   }
  // },
  // {
  //   label: "创建项目",
  //   notShowLabel: true,
  //   value: "createProject",
  //   icon: "statics/header/topiconnew.svg"
  // },
  // {
  //   label: "打开项目",
  //   notShowLabel: true,
  //   value: "openProject",
  //   icon: "statics/header/topiconopen.svg"
  // },
  {
    label: "撤销",
    notShowLabel: true,
    value: "undo",
    icon: "statics/header/topiconundo.svg",
    get disabled() {
      return !stepStatusReactive.hasPreStep;
    }
  },
  {
    label: "重做",
    notShowLabel: true,
    value: "redo",
    icon: "statics/header/topiconredo.svg",
    get disabled() {
      return !stepStatusReactive.hasNextStep;
    }
  },
  // {
  //   label: '刷新',
  //   value: 'toolRefresh',
  //   notShowLabel: true,
  //   get disabled() {
  //     return false;
  //   },
  //   icon: 'statics/header/toolbarfresh.svg',
  // },
]

// 项目特有的菜单
const File = [
  // {
  //   label: "关闭",
  //   value: "closeProject",
  //   icon: "statics/header/topiconclose.svg",
  //   // type: 'dropdown-arrow',
  //   get disabled() {
  //     return false;
  //   }
  // },
  {
    label: "清空",
    value: "clear",
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
      type: "dropdown",
      list: [
        {
          label: "导出为模板",
          value: "exportTemplate",
        }
      ],
      
    },
    {
      value: "splitLine",
      icon: "",
      label: "",
      type: "splitLine"
    },
    {
      label: "加粗",
      value: "bold",
      icon: "statics/subHeader/bold.svg",
      type: "toggle", // 新增
      get disabled() {
        const selectedShapeLength = uiStore?.graphData?.graph?.selectionModel?.selectedShapes?.length
        return !selectedShapeLength || selectedShapeLength === 0;
      }
    },
    {
      label: "倾斜",
      value: "italic",
      icon: "statics/subHeader/italic.svg",
      type: "toggle", // 新增
      get disabled() {
        const selectedShapeLength = uiStore?.graphData?.graph?.selectionModel?.selectedShapes?.length
        return !selectedShapeLength || selectedShapeLength === 0;
      }
    },
    {
      label: "下划线",
      value: "underline",
      icon: "statics/subHeader/underline.svg",
      type: "toggle", // 新增
      get disabled() {
        const selectedShapeLength = uiStore?.graphData?.graph?.selectionModel?.selectedShapes?.length
        return !selectedShapeLength || selectedShapeLength === 0;
      }
    },
    {
      label: "字体颜色",  
      value: "fontColor",
      icon: "statics/subHeader/fontColor.svg",
      type: "fontColor",
      get disabled() {
        const selectedShapeLength = uiStore?.graphData?.graph?.selectionModel?.selectedShapes?.length
        return !selectedShapeLength || selectedShapeLength === 0;
      }
    },
    {
      label: "行高",
      value: "lineHeight",
      icon: "statics/subHeader/lineHeight.svg",
      type: "dropdown",
      list: [
        {
          label: "1.0",
          value: 1.0,
        },
        {
          label: "1.25",
          value: 1.25,
        },
        {
          label: "1.5",
          value: 1.5,
        },
        {
          label: "2.0",
          value: 2.0,
        },
        {
          label: "2.5",
          value: 2.5,
        }
      ],
      get disabled() {
        const selectedShapeLength = uiStore?.graphData?.graph?.selectionModel?.selectedShapes?.length
        return !selectedShapeLength || selectedShapeLength === 0;
      }
    },
    {
      label: "对齐",
      value: "textAlign",
      icon: "statics/subHeader/textAlign.svg",
      type: "dropdown",
      list: [
        {
          label: "左对齐",
          value: "left",
        },
        {
          label: "居中",
          value: "center",
        },
        {
          label: "右对齐",
          value: "right",
        },
      ],
      get disabled() {
        const selectedShapeLength = uiStore?.graphData?.graph?.selectionModel?.selectedShapes?.length
        return !selectedShapeLength || selectedShapeLength === 0;
      }
    },
    {
      value: "splitLine",
      icon: "",
      label: "",
      type: "splitLine"
    },
    {
      label: "调试",
      notShowLabel: false,
      value: "openDevTools",
      icon: "statics/header/debug.svg",
      get disabled() {
        return false;
      }
    },
  // {
  //   label: "起点",
  //   value: 'long-arrow-left',
  //   icon: "statics/header/long-arrow-left.svg",
  //   selectStatus: true, // 是否需要选中状态
  //   type: 'dropdown',
  //   disabled: true,
  //   get list() {
  //     return [
  //       {
  //         label: "实心",
  //         value: HeaderDropdownEnum.leftSolidArrow,
  //         icon: "statics/header/long-arrow-left.svg",
  //       },
  //       {
  //         label: "空心",
  //         value: HeaderDropdownEnum.lefthollowArrow,
  //         icon: "statics/header/long-arrow-left-hollow.svg",
  //       },
  //       {
  //         label: "横线",
  //         value: HeaderDropdownEnum.leftLine,
  //         icon: "statics/header/long-line.svg",
  //       },
  //     ]
  //   }
  // },
  // {
  //   label: "终点",
  //   value: 'long-arrow',
  //   icon: "statics/header/long-arrow.svg",
  //   selectStatus: true, // 是否需要选中状态
  //   type: 'dropdown',
  //   disabled: true,
  //   get list() {
  //     return [
  //       {
  //         label: "实心",
  //         value: HeaderDropdownEnum.rightSolidArrow,
  //         icon: "statics/header/long-arrow.svg",
  //       },
  //       {
  //         label: "空心",
  //         value: HeaderDropdownEnum.righthollowArrow,
  //         icon: "statics/header/long-arrow-hollow.svg",
  //       },
  //       {
  //         label: "横线",
  //         value: HeaderDropdownEnum.rightLine,
  //         icon: "statics/header/long-line.svg",
  //       },
  //     ]
  //   }
  // },
  // {
  //   label: "选择",
  //   value: 'select',
  //   icon: "statics/header/arrow1.svg",
  //   selectStatus: true, // 是否需要选中状态
  // },
  // {
  //   label: "矩形",
  //   value: 'rect',
  //   icon: "statics/header/rect.svg",
  //   selectStatus: true, // 是否需要选中状态
  // },
  // {
  //   label: "菱形",
  //   value: 'lingxing',
  //   icon: "statics/header/lengxing.svg",
  //   selectStatus: true, // 是否需要选中状态
  // },
  // {
  //   label: "圆形",
  //   value: 'circle',
  //   icon: "statics/header/circle.svg",
  //   selectStatus: true, // 是否需要选中状态
  // },
 
  // {
  //   label: "文本",
  //   value: 'text',
  //   icon: "statics/header/input-method-line.svg",
  //   selectStatus: true, // 是否需要选中状态
  // },
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
        return false
      }
    }
]



function concatChildren(...args:any[]) {
  const res:any[] = [];
  args.forEach(arg => {
    arg.forEach((children:any) => {
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