import { CurrentStep } from "src/entities/currentStep.entity"
import { StepEntity } from "src/entities/step.entity"
import { Connection, EntityManager, MoreThanOrEqual } from "typeorm"
import { getUid } from "./common"
import { Change, ChangeType } from "@hfdraw/types"
import { ShapeService } from "src/modules/shape/shape.services"
import { ShapeEntity } from "src/entities/shape.entity"
import { StepService } from "src/modules/step/stepService"
import { WsService, wsService } from "src/modules/socket/WsService"
import { ProjectService } from "src/modules/project/project.services"

export type ExtConnection = Connection & {inUse?:boolean}
export class StepManager {
  projectId: string
  dataBaseName:string
  step: StepEntity
  readonly manager: EntityManager
  projectManager:EntityManager
  curStep: CurrentStep

  projectConnectionMap = new Map<string, ExtConnection>()


  constructor(manager: EntityManager, projectManager?:EntityManager, projectId?: string) {
    this.projectId = projectId;
    this.manager = manager;
    this.projectManager = projectManager;
  }
  async init() {
    await this.initStep();
  }

  async initStep() {
    this.step = this.projectManager.create(StepEntity, { id_: getUid(), projectId: this.projectId, modelChangeIds: [], desc: '', index: 0 });
    this.step.changes = [];
    const curStep = await this.projectManager.getRepository(CurrentStep).findOne({ where: { projectId: this.projectId }, relations: ['step'] });

    //
    if (curStep.stepId === null) {
      this.step.index = 0;
    } else {
      this.step.index = curStep.index + 1;
    }

    this.curStep = curStep;

  }

  async commitStep() {
    if (this.step?.changes?.length ) {
      const stepRep  = this.stepRep;
      // 如果当前步骤不是最后一步，则清除大于这个index的步骤
      if (this.step.index < this.curStep.stepSize) {
        const steps = await stepRep.find({ select: ['id_'], where: { projectId: this.projectId, index: MoreThanOrEqual(this.step.index) } });
        // const changeIds:string[] = [];
        if (steps.length > 0) {
          const stepIds: string[] = steps.map(it => it.id_);

          await stepRep.delete(stepIds);

        }

      }
      //  this.mergeStepChanges(this.step);
      await this.projectManager.save(StepEntity, this.step);
      await this.projectManager.update(CurrentStep, {
        projectId: this.projectId
      }, {
        stepId: this.step.id_,
        stepSize: this.step.index + 1

      });

    }

  }
  /**
   * 合并changes，当一个model或shape在同一个step中有多次change，将这些change合并为一个，提升更新效率
   * @param step
   */
  async mergeStepChanges(step:StepEntity) {
    const changes = step.changes;

    const shapeChangeMap = new Map<number, Change>(); // 图形的change
    const modelChangeMap = new Map<number, Change>(); // 模型的change
    changes.forEach(change => {

      // model的change和shape的change 需要互相隔离，互不影响
      let existChange :Change;
      let changeMap:Map<number, Change>;
      existChange = shapeChangeMap.get(change.shapeId);


      if (!existChange) {
        changeMap.set(change.shapeId, change);
      } else {
        if (change.type === ChangeType.UPDATE) {
          if (existChange.type === ChangeType.INSERT || existChange.type === ChangeType.DELETE) {
            return;
          }
          const newValue = JSON.parse(change.newValue || '{}');
          const newExistValue = JSON.parse(existChange.newValue || '{}');
          const oldExistValue = JSON.parse(existChange.oldValue || '{}');
          const odlValue = JSON.parse(change.oldValue || '{}');
          existChange.newValue = JSON.stringify({ ...newValue, ...newExistValue });
          existChange.oldValue = JSON.stringify({...oldExistValue,...odlValue });
        } else { 
          if (existChange.type === ChangeType.UPDATE) {
            existChange.oldValue = null;
            existChange.newValue = null;
          }
          existChange.type = change.type;

        }
      }

    });
    step.changes = [...shapeChangeMap.values(), ...modelChangeMap.values()];
  }

  get shapeRep() {
    return this.projectManager.getRepository(ShapeEntity);
  }

  get stepRep() {
    return this.projectManager.getRepository(StepEntity);
  }

  private _shapeService: ShapeService
  get shapeService(): ShapeService {
    return this._shapeService || (this._shapeService = new ShapeService(this));

  }

  private _stepService: StepService
  get stepService() {
    return this._stepService || (this._stepService = new StepService(this));

  }

  wsService: WsService = wsService

  private _projectService: ProjectService
  get projectService():ProjectService {
    return this._projectService || (this._projectService = new ProjectService(this));
  }

}