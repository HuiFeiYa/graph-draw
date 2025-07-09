import { Change } from '@hfdraw/types';
import { Entity, Column, PrimaryColumn, Index } from 'typeorm';

@Entity({
  name: 'step'
})
export class StepEntity {

  @PrimaryColumn()
  id_: string;

  @Column({
    nullable: false,
    type: Number
  })
  @Index("projectId")
  projectId: string; // 项目id

  @Column({
    type: 'simple-json',
    nullable: false
  })
  changes: Change[]; // node层的changeId

  @Column({
    type: String,
    default: ''
  })
  desc = ''; // 描述

  @Column({
    nullable: true,
    type: Number
  })
  index: number; // 序号，第几步， 从0开始



}

