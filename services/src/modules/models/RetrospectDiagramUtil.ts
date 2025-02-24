// import { OperationKey } from "./shapeConfig/OperationConfig";
import { RetrospectOption, ShapeKey } from "@hfdraw/types";
import { Model } from "src/entities/model.entity";
export enum RequireMapPosition {
  vertical = "vertical", // 纵向
  horizontal = "horizontal" // 横向
}

// TODO 兼容横向纵向
const nodeSize = 12;
// const verticalGap = 30; // 垂直
// const horizontalGap = 80; // 水平
export const defaultStyleOption = {
  verticalGap: 30,
  horizontalGap: 80
};

export type ToCreateShapeModelTreeType = {
  shapeId: string,
  model: Model | null,
  modelId: string,
  width: number,
  cx: number,
  cy: number,
  retrospectOption: RetrospectOption,
  children: ToCreateShapeModelTreeType[]
};
// 纵向
export class RetrospectTreeNode {
  cx: number
  cy: number
  offset: number
  model: Model
  shapeId: string
  children: Array<RetrospectTreeNode> = []
  retrospectOption: RetrospectOption
  width: number
  requireMapPosition: RequireMapPosition
  styleOption:{
    verticalGap:number
    horizontalGap:number
  }
  constructor({ cx, cy, children, retrospectOption, width, model, shapeId }: ToCreateShapeModelTreeType, requireMapPosition: RequireMapPosition, styleOption = defaultStyleOption) {
    this.model = model;
    this.cx = cx;
    this.cy = cy;
    this.offset = 0;
    this.retrospectOption = retrospectOption;
    this.width = width;
    this.shapeId = shapeId;
    this.requireMapPosition = requireMapPosition;
    this.children = children?.map((child: any) => new RetrospectTreeNode(child, requireMapPosition, styleOption)) || [];
    this.styleOption = styleOption;
  }

  isLeaf(): boolean {
    return this.children.length === 0;
  }

  /**
   * 计算所占宽度
   * @return {*}
   * @memberof RetrospectTreeNode
   */
  calcExtent() {
    const len = this.children.length;
    const extents: any[] = [];
    // 存储子节点占位
    this.children.forEach((child: RetrospectTreeNode) => {
      extents.push(child.calcExtent());
    });
    const rightMost: any[] = [];
    let offset = 0;
    // 根据占位计算偏移量
    extents.forEach((ext, index: number) => {
      offset = 0;
      for (let j = 0; j < Math.min(ext.length, rightMost.length); j++) {
        // TODO 兼容横向纵向
        //  纵向的话  horizontalGap+width
        // 横向的话 取verticalGap
        let number = 0;
        if (this.requireMapPosition === RequireMapPosition.horizontal) {
          number = this.styleOption.verticalGap;
        } else {
          number = this.styleOption.horizontalGap + this.width;
        }
        offset = Math.max(offset, rightMost[j] - ext[j][0] + number);
      }
      for (let j = 0; j < ext.length; j++)
      { if (j < rightMost.length) {
        rightMost[j] = offset + ext[j][1];
      } else {
        rightMost.push(offset + ext[j][1]);
      } }
      this.children[index].offset = offset;
    });

    let state = 0;
    let i0 = 0;

    this.children.forEach((child, index: number) => {
      if (state === 0) {
        state = child.isLeaf() ? 3 : 1;
      } else if (state === 1) {
        if (child.isLeaf()) {
          state = 2;
          i0 = index - 1; // 叶子节点之后找到非叶子节点, 存储结果
        }
      } else if (state === 2) {
        if (!child.isLeaf()) {
          state = 1;
          const dofs = (child.offset - this.children[i0].offset) / (index - i0);
          offset = this.children[i0].offset;
          for (let j = i0 + 1; j < index; j++) {
            this.children[j].offset = offset += dofs;
          }
        }
      } else {
        if (!child.isLeaf()) state = 1;
      }
    });
    this.children.forEach((child) => {
      child.offset -= 0.5 * offset;
    });
    const rtn = [[-0.5 * nodeSize, 0.5 * nodeSize]];
    let left = 0;
    let right = len - 1;
    let i = 0;
    while (left <= right) {
      while (left <= right && i >= extents[left].length) ++left;
      while (left <= right && i >= extents[right].length) --right;
      if (left > right) break;
      let x0 = extents[left][i][0] + this.children[left].offset;
      let x1 = extents[right][i][1] + this.children[right].offset;
      rtn.push([x0, x1]);
      i++;
    }

    return rtn;
  }
  calcPosition(node: any, cx: number, cy: number, height = 40) {
    // TODO 兼容横向纵向
    let number = 0;
    // 横向的话  number 应该是水平间隔horizontalGap+宽度
    // 纵向的话 number应该是高度加垂直间隔verticalGap
    if (node.requireMapPosition === RequireMapPosition.horizontal) {
      number = this.styleOption.horizontalGap + node.width;
    } else {
      number = this.styleOption.verticalGap + height; // 高度40固定后续可能修改
    }
    const children = node?.children || [];
    children.forEach((child: any) => {
      this.calcPosition(child, cx + (child.offset || 0), cy + number + nodeSize);
    });
    node.cx = cx;
    node.cy = cy;
  }
}
