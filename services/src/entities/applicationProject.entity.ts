import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'application_projects' }) // 指定表名
export class ApplicationProject {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  projectId: number;

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
}