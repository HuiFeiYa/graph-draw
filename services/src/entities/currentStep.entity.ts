import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, RelationId } from "typeorm";
import { StepEntity } from './step.entity'
@Entity({
    name: 'current_step'
  })
  export class CurrentStep {
  
    @PrimaryGeneratedColumn()
  
    id_: number;
  
    @Column()
    stepSize: number; // step的总数
    @Column({
      type: Number,
      nullable: true
    })
    index: number; // 当前步骤对应的序号
  
    // @OneToOne(() => StepEntity, {
    //   onDelete: "SET NULL"
    // })
    // @JoinColumn({
    //   name: 'stepId',
    //   referencedColumnName: 'id_'
    // })
    // step: StepEntity;
  
    // @RelationId((c:CurrentStep) => c.step)
    @Column({
      type: String,
      nullable: true
    })
  
    stepId:string|null
  
    @Column({
      type: String,
      nullable: false
    })
    projectId:string
  
  }
  
  