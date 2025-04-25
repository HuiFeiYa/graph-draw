import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

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
}