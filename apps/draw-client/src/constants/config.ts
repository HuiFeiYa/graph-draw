import { SiderbarItemKey } from '@hfdraw/types'
export const HeaderHeight = 38;
export const SideBarWidth = 200;
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

export const StType = {
  "SysML::Blocks::Block": "SysML::Blocks::Block",
  "SysML::ItemFlow": "SysML::ItemFlow",
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

export const siderBarList = [
  {
    modelId: "SysML::Blocks::Block",
    operation: "",
    dropdownTag: "",
    showData: {
      name: "开始/结束",
      icon: "statics/siderBar/startend.png",
      siderBarkey: SiderbarItemKey.Start,
    },
  },
  {
    modelId: "SysML::Blocks::Block",
    operation: "",
    dropdownTag: "",
    showData: {
      name: "矩形",
      icon: "statics/siderBar/rect.png",
      siderBarkey: SiderbarItemKey.Block,
    },
  },
  {
    modelId: "SysML::ItemFlow",
    operation: "",
    dropdownTag: "",
    showData: {
      name: "直线",
      icon: "statics/siderBar/line.png",
      siderBarkey: SiderbarItemKey.ItemFlow,
    },
  },
  {
    modelId: "SysML::Decide",
    operation: "",
    dropdownTag: "",
    showData: {
      name: "判定",
      icon: "statics/siderBar/decide.png",
      siderBarkey: SiderbarItemKey.Decide,
    },
  },
];
