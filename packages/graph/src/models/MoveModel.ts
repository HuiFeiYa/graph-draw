import { EventType, Shape, SubShapeType } from "@hfdraw/types";
import { Point } from "../util/Point";
import { GraphModel } from "./GraphModel";
import { emitter } from "../util/Emitter";

export type MoveRange = {
    dxMin: number,
    dyMin: number,
    dxMax: number,
    dyMax: number

}

export class MoveModel {
    movingShapes: Shape[] = [] // 被移动的shapes
    startPoint: Point = new Point() // 移动起始时的鼠标的坐标
    endPoint: Point = new Point() // 移动过程中鼠标的坐标
    mouseDown = false
    moved = false
    showMovingPreview = false
    previewDx = 0;
    previewDy = 0
    // startMoveSource!: StartMoveSource
    clearEvents?: () => void
    limitRange: MoveRange = { dxMin: 0, dyMin: 0, dxMax: 0, dyMax: 0 }
    constructor(public graph: GraphModel) {
    }
    startMove(event: MouseEvent,  mouseDownShape?: Shape) {
        if (mouseDownShape) {
            this.startPoint.x = event.clientX;
            this.startPoint.y = event.clientY;
            this.endPoint.x = event.clientX;
            this.endPoint.y = event.clientY;
            this.mouseDown = true;
            this.movingShapes = [mouseDownShape];
            this.previewDx = 0;
            this.previewDy = 0;
            const onMouseMove = this.onMouseMove.bind(this);
            this.clearEvents = () => {
                emitter.off(EventType.SHAPE_MOUSE_MOVE, onMouseMove);
                emitter.off(EventType.SHAPE_MOUSE_UP, onMouseUp);
                window.removeEventListener('mouseup', onMouseUp); // 如果移动到了画布或窗口之外
            };
            const onMouseUp = () => {
                this.clearEvents?.();
                this.clearEvents = undefined;
                this.endMove();
            };
            emitter.on(EventType.SHAPE_MOUSE_MOVE, onMouseMove);
            emitter.on(EventType.SHAPE_MOUSE_UP, onMouseUp);
            window.addEventListener('mouseup', onMouseUp);
        } else {
            this.movingShapes = []
            this.clear()
            // this.graph.selectionModel.clearSelection()
        }
    }
    async onMouseMove(event: MouseEvent, shape: Shape) {
        const movingShapes = this.movingShapes
        // 移动时展示预览框
        this.showMovingPreview = true;
        /** 当线有连接不可以移动 */
        for (const s of movingShapes) {
            if (s.subShapeType === SubShapeType.CommonEdge && (s.sourceId || s.targetId)) {
                return
            }
        }
        if (!this.mouseDown) return
        this.moved = true;
        this.endPoint.x = event.clientX;
        this.endPoint.y = event.clientY;
        let dx = this.endPoint.x - this.startPoint.x;
        let dy = this.endPoint.y - this.startPoint.y;

        this.previewDx = dx;
        this.previewDy = dy;
        // console.log('previewDx', this.previewDx, 'previewDy', this.previewDy)
    }
    async endMove() {
        this.graph.selectionModel.setSelection(this.movingShapes)
        this.graph.graphOption.customEndMove?.(this, this.previewDx, this.previewDy)
        this.mouseDown = false;
        this.clear();
    }
    clear() {
        this.clearEvents?.();
        this.mouseDown = false;
        this.moved = false;
        this.showMovingPreview = false;
    }
}