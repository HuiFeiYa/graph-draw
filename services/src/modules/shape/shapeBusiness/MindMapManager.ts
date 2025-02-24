import { StType } from "@hfdraw/types";
import { Model } from "src/entities/model.entity";
import { ShapeEntity } from "src/entities/shape.entity";
import { RequireMapPosition, RetrospectTreeNode } from "src/modules/models/RetrospectDiagramUtil";
import { shapeFactory } from "src/modules/models/ShapeFactory";
import { CreateMindMapRectDto, ToCreateShapeModelTreeType } from "src/types/shape.dto";
import { treeForEachAsync } from "src/utils/common";
import { Point } from "src/utils/Point";

export  class MindMapManager {
    static async createShape(dto:CreateMindMapRectDto, shapeMap:Map<string, ShapeEntity>) {
        
    
        const { projectId, depth, shapeId, diagramId} = dto;
      // 基于 shapeId 查找 sourceShape
      const sourceShape = shapeMap.get(shapeId);
      const diagramShape = shapeMap.get(diagramId);
      const shapeOption = shapeFactory.getModelShapeOption(StType["SysML::MindMap"]);
      const createShape = ShapeEntity.fromOption(shapeOption, projectId);
      const point = { x: sourceShape.bounds.absX, y: sourceShape.bounds.absY };
      const shapeDepth = depth + 1;
      // 初始化创建的 shape 的追溯选项
      createShape.style.retrospectOption = {
        parentNodeId: sourceShape.id,
        shapeDepth,
        relationTypes:  [],
        expand: false // 标记展开状态
      };
      this.refreshShape(point, createShape, sourceShape);
      return createShape;
    }
    static refreshShape(point: Point, shape: ShapeEntity, diagramShape: ShapeEntity) {
        shape.bounds.absX = point.x;
        shape.bounds.absY = point.y;
        shape.bounds.x = shape.bounds.absX - diagramShape.bounds.absX;
        shape.bounds.y = shape.bounds.absY - diagramShape.bounds.absY;
        shape.boundsChanged = true;
        return shape;
    }
    static async getMindMapTree(startShape: ShapeEntity,shapeMap:Map<string, ShapeEntity>) {
        const toCreateShapeModelTree: ToCreateShapeModelTreeType = {
          shapeId: startShape.id,
          modelId: startShape.modelId,
          width: startShape.bounds.width,
          cx: startShape.bounds.absX,
          cy: startShape.bounds.absY,
          retrospectOption: startShape.style.retrospectOption,
          children: []
        };
        for (let item of toCreateShapeModelTree.retrospectOption.relationTypes) {
          const treeNode: ToCreateShapeModelTreeType = {
            shapeId: '',
            modelId: item.id,
            width: 0,
            cx: 0,
            cy: 0,
            retrospectOption: {
              shapeDepth: toCreateShapeModelTree.retrospectOption.shapeDepth + 1,
              expand: false,
              parentNodeId: toCreateShapeModelTree.shapeId,
              relationTypes: []
            },
            children: []
          };
          const existShape = shapeMap.get(treeNode.shapeId);
          if (existShape) {
            treeNode.shapeId = existShape.id;
            treeNode.width = existShape.bounds.width;
            treeNode.modelId = existShape.modelId;
            treeNode.retrospectOption = { ...existShape.style.retrospectOption };
          }
        }
        return toCreateShapeModelTree;
      }
      static async calcTreePosition(sourceShape: ShapeEntity,shapeMap:Map<string, ShapeEntity>) {
        const updateShapes: Set<ShapeEntity> = new Set();
        // 获取需要更新的模型树
        const toCreateShapeModelTree = await this.getMindMapTree(sourceShape,shapeMap);
        const newTree = new RetrospectTreeNode(toCreateShapeModelTree, RequireMapPosition.horizontal);
        const aboveTopHeight = this.getAboveTopHeight(newTree);
        newTree.calcExtent();
        newTree.calcPosition(newTree, toCreateShapeModelTree.cy, toCreateShapeModelTree.cx,  40);
        await treeForEachAsync([newTree], async (item, parent) => {
          const shape = shapeMap.get(item.shapeId);
          this.refreshShape({ x: item.cy, y: item.cx + aboveTopHeight }, shape, sourceShape);
          updateShapes.add(shape);
        })
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
}