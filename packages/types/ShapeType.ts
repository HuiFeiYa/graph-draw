export enum ShapeType {
    Symbol = "Symbol", // 图形外框
    Port = "Port", // 端口
    Edge = "Edge", // 连线
    Diagram = "Diagram", // 画布
    EdgeLabel = "EdgeLabel", // 线上的label
  }

  export enum SubShapeType {
    TextBox = "TextBox",
    Block = "Block",
    Decide = 'Decide',
    CommonEdge = 'CommonEdge' ,
    MindMap="MindMap",
    MindMapLine="MindMapLine",
    PathShape="PathShape"
  }
  /**
 * shapeKey是最细的标识，用于标识各个图形，用于业务逻辑中的图形逻辑判断，基本每个模型都会对应一到多个
 */
export enum ShapeKey {
    Block = "Block",
    Diagram = "Diagram",
    Association = "Association", // 关联
    MindMapShape = "MindMapShape",
    StraightLine = "StraightLine",
    Pentagon = "Pentagon",
    Mark = "Mark",
    Rhombus = "Rhombus",
    Triangle = "Triangle",
    Ellipse = "Ellipse",
    Circle = "Circle",
    RightAngle = "RightAngle",
}