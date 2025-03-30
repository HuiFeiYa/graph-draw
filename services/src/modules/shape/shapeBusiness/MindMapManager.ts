import { StType } from '@hfdraw/types';
import { Model } from 'src/entities/model.entity';
import { ShapeEntity } from 'src/entities/shape.entity';
import {
  RequireMapPosition,
  RetrospectTreeNode,
} from 'src/modules/models/RetrospectDiagramUtil';
import { shapeFactory } from 'src/modules/models/ShapeFactory';
import {
  CreateMindMapRectDto,
  ToCreateShapeModelTreeType,
} from 'src/types/shape.dto';
import { treeForEachAsync } from 'src/utils/common';
import { Point } from 'src/utils/Point';
import { mindMapOption } from '../shapeConfig/commonShapeOption';

export class MindMapManager {
  static async createShape(
    dto: CreateMindMapRectDto,
    shapeMap: Map<string, ShapeEntity>,
  ) {
    const { projectId, depth, shapeId, diagramId } = dto;
    // 基于 shapeId 查找 sourceShape
    const sourceShape = shapeMap.get(shapeId);
    const shapeOption = shapeFactory.getModelShapeOption(
      StType['SysML::MindMap'],
    );
    const createShape = ShapeEntity.fromOption(shapeOption, projectId);
    const point = { x: sourceShape.bounds.absX, y: sourceShape.bounds.absY };
    const shapeDepth = depth + 1;
    // 初始化创建的 shape 的追溯选项
    createShape.style.retrospectOption = {
      parentNodeId: sourceShape.id,
      shapeDepth,
      relationTypes: [],
      expand: false, // 标记展开状态
    };
    this.refreshShape(point, createShape, sourceShape);
    return createShape;
  }
  static refreshShape(
    point: Point,
    shape: ShapeEntity,
    diagramShape: ShapeEntity,
  ) {
    shape.bounds.absX = point.x;
    shape.bounds.absY = point.y;
    shape.bounds.x = shape.bounds.absX - diagramShape.bounds.absX;
    shape.bounds.y = shape.bounds.absY - diagramShape.bounds.absY;
    if (shape.nameBounds) {
      shape.nameBounds.absX = shape.bounds.absX + shape.nameBounds.x;
      shape.nameBounds.absY = shape.bounds.absY + shape.nameBounds.y;
      shape.nameBoundsChanged = true;
    }
    shape.boundsChanged = true;
    return shape;
  }
  static async getMindMapTree(
    startShape: ShapeEntity,
    shapeMap: Map<string, ShapeEntity>,
  ) {
    const toCreateShapeModelTree: ToCreateShapeModelTreeType = {
      shapeId: startShape.id,
      width: startShape.bounds.width,
      height: startShape.bounds.height,
      cx: startShape.bounds.absX,
      cy: startShape.bounds.absY,
      modelName: startShape.modelName,
      retrospectOption: startShape.style.retrospectOption,
      children: [],
    };
    for (let item of toCreateShapeModelTree.retrospectOption.relationTypes) {
      const treeNode: ToCreateShapeModelTreeType = {
        shapeId: item.shapeId,
        width: 0,
        height: 0,
        cx: 0,
        cy: 0,
        retrospectOption: {
          shapeDepth: toCreateShapeModelTree.retrospectOption.shapeDepth + 1,
          expand: false,
          parentNodeId: toCreateShapeModelTree.shapeId,
          relationTypes: [],
        },
        children: [],
      };
      const existShape = shapeMap.get(treeNode.shapeId);
      if (existShape) {
        treeNode.shapeId = existShape.id;
        treeNode.width = existShape.bounds.width;
        treeNode.height = existShape.bounds.height;
        treeNode.modelName = existShape.modelName;
        treeNode.retrospectOption = { ...existShape.style.retrospectOption };
        toCreateShapeModelTree.children.push(treeNode);
      }
    }
    return toCreateShapeModelTree;
  }
  /** 计算树的位置 */
  static async calcTreePosition(
    sourceShape: ShapeEntity,
    shapeMap: Map<string, ShapeEntity>,
  ) {
    const updateShapes: Set<ShapeEntity> = new Set();
    // 获取需要更新的模型树
    const toCreateShapeModelTree = await this.getMindMapTree(
      sourceShape,
      shapeMap,
    );
    const newTree = new RetrospectTreeNode(
      toCreateShapeModelTree,
      RequireMapPosition.horizontal,
    );
    const aboveTopHeight = this.getAboveTopHeight(newTree);
    newTree.calcExtent();
    newTree.calcPosition(
      newTree,
      toCreateShapeModelTree.cy,
      toCreateShapeModelTree.cx,
      40,
    );
    await treeForEachAsync([newTree], async (item) => {
      const shape = shapeMap.get(item.shapeId);
      const parentId = item.retrospectOption.parentNodeId;
      const parent = parentId ? shapeMap.get(parentId) : null;
      // 获取父节点的子节点数组
      const parentChildren = parent ? parent.style.retrospectOption.relationTypes.map(item => item.shapeId) : [];
      // 获取当前节点在父节点子节点中的索引
      const index = parentChildren.indexOf(item.shapeId);
      const children = item.children;
      // 获取父节点的子节点数量
      const n = parentChildren.length;
      // 遍历父节点的子节点，计算除当前节点外其他节点的yOffset
      if (children.length > 1 && parentChildren.length > 1) {
        for (let i = 0; i < n; i++) {
          if (i !== index) {
            const otherShapeId = parentChildren[i];
            const otherShape = shapeMap.get(otherShapeId);
            let otherYOffset = 0;
              const halfN = n / 2;
              if (i < halfN) {
                otherYOffset = -halfN * 40; // todo 需要根据子节点个数来调整
              } else if (i >= halfN) {
                otherYOffset = (n - Math.floor(halfN)) * 40;
              }
            // const otherParent = parentId ? shapeMap.get(parentId) : null;
            // const otherDiffY = otherParent ? (otherParent.bounds.height - mindMapOption.bounds.height) / 2 : 0;
            otherShape.bounds.absY += otherYOffset;
            otherShape.boundsChanged = true;
            this.updateChildPositionsOnParentYChange(otherShape,otherYOffset, shapeMap,updateShapes);
            updateShapes.add(otherShape);
          }
        }
      }
      // 根据父节点的高度计算子节点的位置，需要和父节点高度的中点计算
      const diffY = parent ? (parent.bounds.height - mindMapOption.bounds.height) / 2 : 0;
      this.refreshShape(
        { x: item.cy, y: item.cx + aboveTopHeight + diffY  },
        shape,
        sourceShape
      );
      updateShapes.add(shape);
    });
    return updateShapes;
  }
  static getAboveTopHeight(newTree: RetrospectTreeNode) {
    let minCy = 0;
    function getCy(newTree2: RetrospectTreeNode) {
      if (newTree2.cx < minCy) {
        minCy = newTree2.cx;
      }
      for (let item of newTree2.children) {
        getCy(item);
      }
    }
    getCy(newTree);
    return minCy < 0 ? Math.abs(minCy) : 0;
  }
  /** 更新 sourceShape 的追溯关联选项 */ 
  static addRetrospectOption(sourceShape: ShapeEntity, childShapeId: string) {
    const partialEntity: Partial<ShapeEntity> = {
      style: {
        ...(sourceShape.style || {}),
        retrospectOption: {
          ...sourceShape.style.retrospectOption,
          relationTypes: [
            ...sourceShape.style.retrospectOption.relationTypes,
            { shapeId: childShapeId },
          ],
          expand: true, // 标记展开状态
        },
      },
    };
    sourceShape.style = partialEntity.style;
    sourceShape.styleChanged = true;
    return sourceShape;
  }
  static updateChildPositionsOnParentYChange(parentShape:ShapeEntity,yChange:number, shapeMap: Map<string, ShapeEntity>,updateShapes: Set<ShapeEntity>) {
    const childrenIds = parentShape.style.retrospectOption.relationTypes.map(item => item.shapeId);
    childrenIds.forEach(childId => {
      const childShape = shapeMap.get(childId);
      if (childShape) {
        childShape.bounds.absY += yChange;
        childShape.boundsChanged = true;
        updateShapes.add(childShape);
        if (childShape.style.retrospectOption.relationTypes.length > 0) {
          this.updateChildPositionsOnParentYChange(childShape,yChange, shapeMap,updateShapes);
        }
      }
    });
  }
}
