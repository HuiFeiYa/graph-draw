import { CommonConfig } from '@hfdraw/types';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
export const defaluCommonConfig = {
  style: {
    strokeColor: 'rgba(21,71, 146,0.5)',
    bgColor: '#ffffff'
  },
  canvasWidth: 1800,
  canvasHeight: 1650,
  watermarkText: 'HfDraw@会飞',
  showWatermark: true
}
@Entity({ name: 'application_projects' }) // 指定表名
export class ApplicationProject {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  projectId: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @CreateDateColumn({
    type: String,
    nullable: false
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: String,
    nullable: false
  })
  updatedAt: Date;

  @Column({
    type: 'boolean',
    nullable: true,
    default: false

  })
  dbClose?:boolean // 标记数据库关闭
  @Column({
    type: "simple-json",
    nullable: false,
    default: JSON.stringify(defaluCommonConfig)
  })
  commonConfig: CommonConfig;
}