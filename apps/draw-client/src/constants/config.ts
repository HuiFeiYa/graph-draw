import { SiderbarItemKey, StType } from '@hfdraw/types'
export const HeaderHeight = 38;
export const SideBarWidth = 200;
export const popoverGap = 20;
export const popoverWidth = 58;
export const popoverHeight = 48;
export const EdgeMoveType = {
  Segment: "Segment", // 线段拖动
  Waypoint: "Waypoint", // waypoint拖动
  SourcePoint: "SourcePoint", // 起点拖动
  TargetPoint: "TargetPoint", // 终点拖动
};

export const MarkerColor = {
  valid: "#1890FF",
  invalid: "#FF181F",
};

export const EventType = {
  SHAPE_INIT_EDIT: "SHAPE_INIT_EDIT",
  SHAPE_CLICK: "SHAPE_CLICK",
  SHAPE_DBL_CLICK: "SHAPE_DBL_CLICK",
  SHAPE_MOUSE_DOWN: "SHAPE_MOUSE_DOWN",
  SHAPE_MOUSE_UP: "SHAPE_MOUSE_UP",
  SHAPE_MOUSE_MOVE: "SHAPE_MOUSE_MOVE",
  NAME_LABEL_CLICK: "NAME_LABEL_CLICK",
  SLOT_LABEL_CLICK: "SLOT_LABEL_CLICK",
  SHAPE_DRAG_ENTER: "SHAPE_DRAG_ENTER",
  SHAPE_DRAG_LEAVE: "SHAPE_DRAG_LEAVE",
  SHAPE_DRAG_DROP: "SHAPE_DRAG_DROP",
  SHAPE_DRAG_OVER: "SHAPE_DRAG_OVER",
  SELECTION_CHANGE: "SELECTION_CHANGE",
};

export const VertexType = {
  leftTop: 1,
  rightTop: 2,
  rightBottom: 3,
  leftBottom: 4,
};

export const CreatePointType = {
  Top: 1,
  Right: 2,
  Bottom: 3,
  Left: 4,
};



export const MetaclassType = {
  Class: "Class",
  ItemFlow: "ItemFlow",
  FlowDiagram: "FlowDiagram",
};



export const SubShapeType = {
    Decide: "Decide",
    Block: "Block"
}
export const ArrowType = {
  ContainArrow: "ContainArrow",
  DiamondHollowArrow: "DiamondHollowArrow",
  DiamondSolidArrow: "DiamondSolidArrow",
  Arrow: "Arrow",
  TriangleHollowArrow: "TriangleHollowArrow",
  TriangleSolidArrow: "TriangleSolidArrow",
};
export const showQuickCreateList = [SubShapeType.Block, SubShapeType.Decide];
export const showDashboardList = [
  SiderbarItemKey.Block,
  SiderbarItemKey.Decide,
  SiderbarItemKey.Start,
];
export interface SidebarKeyItem {
  sidebarKey: StType;
  showData: {
    name: string;
    icon: string;
  };
}
export const sideBarList: SidebarKeyItem[] = [
  {
    sidebarKey: StType['SysML::Start'],
    showData: {
      name: "开始/结束",
      icon: "statics/siderBar/startend.png",
    },
  },
  {
    sidebarKey: StType['SysML::Blocks::Block'],
    showData: {
      name: "矩形",
      icon: "statics/siderBar/rect.png",
    },
  },
  {
    sidebarKey: StType["SysML::Line"],
    showData: {
      name: "直线",
      icon: "statics/siderBar/line.png",
    },
  },
  {
    sidebarKey: StType["SysML::Pentagon"],
    showData: {
      name: "五边形",
      icon: "statics/siderBar/pentagon.svg",
    },
  }
];

/**
 * socket 连接状态
 */
export enum ConnectStatus {
  /**
   * 未连接
   */
  UNCONNECT = 0,
  /**
   * 已连接
   */
  CONNECTED = 1,
  /**
   * 正在重连
   */
  RECONNECTING = 2,
  /**
   * 连接已关闭
   */
  CLOSED = 3,

  /**
   * 连接异常
   */
  CONNECT_ERROR = 4
}


export enum BusEvent {
  INSERT_SHAPE="INSERT_SHAPE", // 图形增加
  DELETE_SHAPE="DELETE_SHAPE", // 图形删除
  UPDATE_SHAPE="UPDATE_SHAPE", // 图形更新
  CLEAR_STATUS="CLEAR_STATUS", // 清除选中状态，箭头
  REFRESH="REFRESH",
  // 清除鼠标悬浮状态
  MOUSE_DOWN_OUT="MOUSE_DOWN_OUT",
  CLEAR_HOVER_SHAPE="CLEAR_HOVER_SHAPE"
}
/**
 * 风格列表
 */
export const styleList = [
  {
    icon: 'statics/siderBar/default.svg',
    bgColor: '#ffffff',
    borderColor: 'rgba(21,71, 146,0.5)',
  },
  {
    icon: 'statics/siderBar/white.svg',
    bgColor: '#ffffee',
    borderColor: '#000000',
  },
  {
    icon: 'statics/siderBar/gray.svg',
    bgColor: '#d6d6d6',
    borderColor: '#000000',
  },
  {
    icon: 'statics/siderBar/green.svg',
    bgColor: '#cbeddb',
    borderColor: '#127731',
  },
  {
    icon: 'statics/siderBar/orange.svg',
    bgColor: '#f4b49d',
    borderColor: '#c65132',
  },
]