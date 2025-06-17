import { Shape, Bounds, IPoint, EventType, ShapeType, SubShapeType, ShapeKey, VertexType } from "@hfdraw/types";
import { Point } from "../util/Point";
import { GraphModel } from "./GraphModel";

// 简化的网格对齐函数
function getGridNum(value: number): number {
  const gridSize = 10; // 假设网格大小为10
  return Math.round(value / gridSize) * gridSize;
}



export class ResizeModel {
  resizeShape: Shape | undefined;
  startPoint: IPoint = new Point();
  endPoint: IPoint = new Point();
  newStartPoint: IPoint = new Point();
  showResizePreview = false;
  mouseDown = false;
  resizeIndex = VertexType.leftTop;
  previewBounds = new Bounds();
  minimumBounds = new Bounds();
  clearEvents?: () => void;

  constructor(public graph: GraphModel) {}

  init() {
    // 初始化逻辑
  }

  clear() {
    this.showResizePreview = false;
    this.clearEvents?.();
  }

  async startResize(event: MouseEvent, resizeShape: Shape, resizeIndex: VertexType) {
    const res = await this.graph.graphOption.getMinimumBounds?.(resizeShape, resizeIndex);
    const data = res?.data;
    if (data) {
      const { x, y, width, height, absX, absY } = data;
      this.minimumBounds = new Bounds(x, y, width, height, absX, absY);
    }
    this.resizeShape = resizeShape;
    this.resizeIndex = resizeIndex;
    this.mouseDown = true;
    this.showResizePreview = true;
    this.previewBounds = { ...resizeShape.bounds };
    
    const startPoint = this.graph.viewModel.translateClientPointToDiagramAbsPoint(new Point(event.clientX, event.clientY));
    this.startPoint = startPoint;
    this.endPoint = startPoint.clone();
    
    const onMouseMove = this.onMouseMove.bind(this);
    this.clearEvents?.();
    this.clearEvents = () => {
      this.graph.emitter.off(EventType.SHAPE_MOUSE_MOVE, onMouseMove);
      this.graph.emitter.off(EventType.SHAPE_MOUSE_UP, onMouseUp);
      window.removeEventListener('mouseup', onMouseUp);
    };
    
    const onMouseUp = () => {
      this.clearEvents?.();
      this.clearEvents = undefined;
      this.endMove();
    };
    
    this.graph.emitter.on(EventType.SHAPE_MOUSE_MOVE, onMouseMove);
    this.graph.emitter.on(EventType.SHAPE_MOUSE_UP, onMouseUp);
    window.addEventListener('mouseup', onMouseUp);
  }

  onMouseMove(event: MouseEvent) {
    const endPoint = this.graph.viewModel.translateClientPointToDiagramAbsPoint(new Point(event.clientX, event.clientY));
    this.endPoint = endPoint;

    let dx = this.endPoint.x - this.startPoint.x;
    let dy = this.endPoint.y - this.startPoint.y;

    if (this.resizeShape) {
      const originBounds = this.resizeShape.bounds;
      const previewBounds = this.previewBounds;
      switch (this.resizeIndex) {
        case VertexType.leftTop: {
      
            previewBounds.absX = originBounds.absX + dx;
            previewBounds.absY = originBounds.absY + dy;

            previewBounds.absX = getGridNum(previewBounds.absX);
            previewBounds.absY = getGridNum(previewBounds.absY);

            previewBounds.absX = Math.min(previewBounds.absX, this.minimumBounds.absX);
            previewBounds.absY = Math.min(previewBounds.absY, this.minimumBounds.absY);

            previewBounds.width = originBounds.absX + originBounds.width - previewBounds.absX;
            previewBounds.height = originBounds.absY + originBounds.height - previewBounds.absY;
          break;
        }
        case VertexType.rightTop: {
          if (this.resizeShape.shapeType !== ShapeType.Diagram) {
            previewBounds.absY = originBounds.absY + dy;
            previewBounds.absY = getGridNum(previewBounds.absY);
            previewBounds.absY = Math.min(previewBounds.absY, this.minimumBounds.absY);
          }

          previewBounds.width = originBounds.width + dx;
          previewBounds.width = getGridNum(previewBounds.width);

          if (previewBounds.absX + previewBounds.width < this.minimumBounds.absX + this.minimumBounds.width) {
            previewBounds.width = this.minimumBounds.absX + this.minimumBounds.width - previewBounds.absX;
          }
          const RectContainerHeight = 12;
          previewBounds.height = originBounds.absY + originBounds.height - Math.max(previewBounds.absY, RectContainerHeight);
          break;
        }
        case VertexType.rightBottom: {
       
            previewBounds.width = originBounds.width + dx;
            previewBounds.width = getGridNum(previewBounds.width);
            if (previewBounds.absX + previewBounds.width < this.minimumBounds.absX + this.minimumBounds.width) {

              previewBounds.width = this.minimumBounds.absX + this.minimumBounds.width - previewBounds.absX; //  this.minimumBounds.absX + this.minimumBounds.width - (previewBounds.absX + previewBounds.width);
            }
            previewBounds.height = originBounds.height + dy;
            previewBounds.height = getGridNum(previewBounds.height);

            if (previewBounds.absY + previewBounds.height < this.minimumBounds.absY + this.minimumBounds.height) {

              previewBounds.height = this.minimumBounds.absY + this.minimumBounds.height - previewBounds.absY; //  this.minimumBounds.absX + this.minimumBounds.width - (previewBounds.absX + previewBounds.width);
            }

          break;
        }
        case VertexType.leftBottom: {
          if (this.resizeShape.shapeType !== ShapeType.Diagram) {
            previewBounds.absX = originBounds.absX + dx;
            previewBounds.absX = getGridNum(previewBounds.absX);
            previewBounds.absX = Math.min(previewBounds.absX, this.minimumBounds.absX);

          }

          previewBounds.width = originBounds.absX + originBounds.width - previewBounds.absX;

          previewBounds.height = originBounds.height + dy;
          previewBounds.height = getGridNum(previewBounds.height);

          if (previewBounds.absY + previewBounds.height < this.minimumBounds.absY + this.minimumBounds.height) {

            previewBounds.height = this.minimumBounds.absY + this.minimumBounds.height - previewBounds.absY; //  this.minimumBounds.absX + this.minimumBounds.width - (previewBounds.absX + previewBounds.width);
          }
          break;
        }
      }
    }
  }

  async endMove() {
    this.mouseDown = false;
    if (this.resizeShape) {
      this.graph.graphOption.onShapeResized?.(this.resizeShape, this.resizeIndex, this.previewBounds).finally(() => {
        this.graph.resizeModel.showResizePreview = false;
      });
    }
    this.newStartPoint = new Point();
  }
}