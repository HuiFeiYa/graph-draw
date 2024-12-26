import { shapeService } from "./ShapeService";
import { reactive } from 'vue';
export class StepStatus {
  
    /**
      * 项目当前所处的stepId，如果savedStepId和currentStepId不同则说明有更新
      */
    currentStepId?:string
  
    /**
      * 是否有前面的步骤（可以undo）
      */
    hasPreStep =false
  
    /**
      * 是否有后面的步骤（可以redo）
      */
    hasNextStep =false
  
    isFresh =false

    constructor() {
  
    }
  
    async fresh(projectId: string) {
      this.isFresh = true;
      const data = await shapeService.getStepStatus(projectId);
      const { currentStepId, hasNextStep, hasPreStep } = data;
      this.isFresh = false;
      this.currentStepId = currentStepId;
      this.hasNextStep = hasNextStep;
      this.hasPreStep = hasPreStep;
    }
  
    clear() {
      this.currentStepId = undefined;
      this.hasPreStep = false;
      this.hasNextStep = false;
      this.isFresh = false;
    }
  
    update(stepStatus: Partial<StepStatus>) {
      Object.assign(this, stepStatus);
    }
  }
const stepStatus = new StepStatus();
export const stepStatusReactive = reactive(stepStatus);