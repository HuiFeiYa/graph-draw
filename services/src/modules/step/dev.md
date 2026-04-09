# Step 模块 WebSocket 消息推送逻辑说明

## 概述

在 Step 模块中，undo 和 redo 操作的 WebSocket 消息推送采用了与普通编辑操作不同的实现方式。

## 实现方式对比

### 普通编辑操作的消息推送

普通的编辑操作（如移动、创建、删除图形等）通过 `transaction` 工具函数自动处理 WebSocket 消息推送：

```typescript
// 在 transaction.ts 中的自动推送逻辑
if (res.stepManager.step?.changes?.length) {
    res.stepManager.wsService.sendToSubscribedClient(projectId, {
        type: WsMessageType.step,
        data: {
            projectId,
            changes: res.stepManager.step?.changes,
            stepType: StepType.edit
        }
    });
}
```

这种方式的前提条件：
- `initStep: true`（默认值）
- `stepManager.step` 被初始化
- `stepManager.step.changes` 包含变更数据

### Undo/Redo 操作的消息推送

Undo 和 Redo 操作采用手动推送方式，原因如下：

#### 为什么不能使用自动推送

1. **initStep 设置为 false**：
   ```typescript
   await transaction({
     projectId: dto.projectId,
     lockProject: true,
     initStep: false,  // 关键：不初始化新的 step
   }, async (stepManager) => {
     changes = await stepManager.stepService.undoStep(dto.projectId);
   });
   ```

2. **stepManager.step 未被初始化**：
   - 由于 `initStep: false`，`stepManager.step` 保持为 `undefined`
   - `transaction` 中的自动推送逻辑 `res.stepManager.step?.changes?.length` 条件不满足
   - 无法触发自动 WebSocket 消息推送

#### 手动推送实现

```typescript
@Post('undo')
async undo(@Body() dto: UndoDto) {
  let changes: Change[] = []
  await transaction({
    projectId: dto.projectId,
    lockProject: true,
    initStep: false,
  }, async (stepManager) => {
    changes = await stepManager.stepService.undoStep(dto.projectId);
  });
  
  // 手动推送 WebSocket 消息
  wsService.sendToSubscribedClient(dto.projectId, {
    type: WsMessageType.step,
    data: {
        projectId: dto.projectId,
        changes,
        stepType: StepType.undo
    }
  });
  return new ResData(null);
}

@Post('redo')
async redo(@Body() dto: BaseProjectDto) {
  const projectId = dto.projectId;
  let changes: Change[] = []
  await transaction({
    projectId: projectId,
    lockProject: true,
    initStep: false,
  }, async (stepManager) => {
    changes = await stepManager.stepService.redoStep(projectId);
  });
  
  // 手动推送 WebSocket 消息
  wsService.sendToSubscribedClient(dto.projectId, {
    type: WsMessageType.step,
    data: {
        projectId: dto.projectId,
        changes,
        stepType: StepType.redo
    }
  });
  return new ResData(null);
}
```

## 设计原理

### 为什么 Undo/Redo 不需要 initStep

1. **操作性质不同**：
   - 普通编辑操作：创建新的步骤记录当前变更
   - Undo/Redo 操作：在已有步骤之间切换，不创建新步骤

2. **数据流向不同**：
   - 普通编辑：当前操作 → 新步骤 → 推送变更
   - Undo/Redo：历史步骤 → 当前状态 → 推送变更

3. **stepType 区分**：
   - 普通编辑：`StepType.edit`
   - Undo 操作：`StepType.undo`
   - Redo 操作：`StepType.redo`

## 总结

这种设计确保了：
1. **功能正确性**：Undo/Redo 操作正确地在历史步骤间切换
2. **消息推送**：客户端能够接收到正确的变更通知
3. **类型区分**：客户端可以根据 `stepType` 区分不同类型的操作
4. **架构清晰**：不同类型的操作采用适合的推送策略