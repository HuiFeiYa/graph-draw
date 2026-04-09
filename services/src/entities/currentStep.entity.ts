import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, RelationId } from "typeorm";
@Entity({
    name: 'currentStep'
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
  
  