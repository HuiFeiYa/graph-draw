import { SubShapeType } from "./ShapeType";

export enum EdgeMoveType {
  Segment = "Segment", // 线段拖动
  Waypoint = "Waypoint", // waypoint拖动
  SourcePoint = "SourcePoint", // 起点拖动
  TargetPoint = "TargetPoint", // 终点拖动
}

export enum MarkerColor {
  valid = "#1890FF",
  invalid = "#FF181F",
}

export enum EventType {
  SHAPE_INIT_EDIT = "SHAPE_INIT_EDIT",
  SHAPE_CLICK = "SHAPE_CLICK",
  SHAPE_DBL_CLICK = "SHAPE_DBL_CLICK",
  SHAPE_MOUSE_DOWN = "SHAPE_MOUSE_DOWN",
  SHAPE_MOUSE_UP = "SHAPE_MOUSE_UP",
  SHAPE_MOUSE_MOVE = "SHAPE_MOUSE_MOVE",
  SHAPE_MOUSE_OVER = 'SHAPE_MOUSE_OVER',
  NAME_LABEL_CLICK = "NAME_LABEL_CLICK",
  SLOT_LABEL_CLICK = "SLOT_LABEL_CLICK",
  SHAPE_DRAG_ENTER = "SHAPE_DRAG_ENTER",
  SHAPE_DRAG_LEAVE = "SHAPE_DRAG_LEAVE",
  SHAPE_DRAG_DROP = "SHAPE_DRAG_DROP",
  SHAPE_DRAG_OVER = "SHAPE_DRAG_OVER",
  SELECTION_CHANGE = "SELECTION_CHANGE",
}

export enum VertexType {
  leftTop=1,
  rightTop=2,
  rightBottom=3,
  leftBottom=4,
  left=5,
  top=6,
  right=7,
  bottom=8
}

export enum CreatePointType {
  Top = 1,
  Right = 2,
  Bottom = 3,
  Left = 4,
}

export enum SiderbarItemKey {
  Block = "Block",
  ItemFlow = "ItemFlow",
  FlowDiagram = "FlowDiagram",
  Start = "Start",
  Decide = "Decide",
  Aggregation = "Aggregation"
}

export enum MetaclassType {
  Class = "Class",
  ItemFlow = "ItemFlow",
  FlowDiagram = "FlowDiagram",
  Diagram = "Diagram"
}

export enum StType {
  "SysML::Blocks::Block" = "SysML::Blocks::Block",
  "SysML::ItemFlow" = "SysML::ItemFlow",
  "SysML::Decide" = "SysML::Decide",
  "SysML::Association" = "SysML::Association"
}


export enum ArrowType {
  ContainArrow = "ContainArrow",
  DiamondHollowArrow = "DiamondHollowArrow",
  DiamondSolidArrow = "DiamondSolidArrow",
  Arrow = "Arrow",
  TriangleHollowArrow = "TriangleHollowArrow",
  TriangleSolidArrow = "TriangleSolidArrow",
}

// 注意：以下常量不能直接转换为 enum 类型，因为它们是数组
export const showQuickCreateList = [SubShapeType.Block, SubShapeType.Decide];
export const showDashboardList = [
  SiderbarItemKey.Block,
  SiderbarItemKey.Decide,
  SiderbarItemKey.Start,
];

// siderBarList 也不能直接转换为 enum 类型，因为它是一个对象数组
export const siderBarList = [
  {
    modelId: StType["SysML::Blocks::Block"],
    operation: "",
    dropdownTag: "",
    showData: {
      name: "开始/结束",
      icon: "statics/siderBar/startend.png",
      siderBarkey: SiderbarItemKey.Start,
    },
  },
  {
    modelId: StType["SysML::Blocks::Block"],
    operation: "",
    dropdownTag: "",
    showData: {
      name: "矩形",
      icon: "statics/siderBar/rect.png",
      siderBarkey: SiderbarItemKey.Block,
    },
  },
  {
    modelId: StType["SysML::ItemFlow"],
    operation: "",
    dropdownTag: "",
    showData: {
      name: "直线",
      icon: "statics/siderBar/line.png",
      siderBarkey: SiderbarItemKey.ItemFlow,
    },
  },
  {
    modelId: StType["SysML::Decide"],
    operation: "",
    dropdownTag: "",
    showData: {
      name: "判定",
      icon: "statics/siderBar/decide.png",
      siderBarkey: SiderbarItemKey.Decide,
    },
  },
];

export const  siderbarItemKeyToStTypeMap = {
 [SiderbarItemKey.Aggregation]: StType["SysML::Association"],
 [SiderbarItemKey.Block]: StType['SysML::Blocks::Block']
}
