import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class SnapshotShape {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'json' })
  data: Record<string, any>;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;
} 