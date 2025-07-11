import { CommonConfig } from '@hfdraw/types';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';



@Entity({ name: 'projects' }) // 指定表名
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;
  @Column()
  projectId: string;
  
  @Column({ type: 'text', nullable: true })
  description?: string;

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