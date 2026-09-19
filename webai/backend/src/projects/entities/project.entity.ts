import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
@Entity('projects')

export class Project {

 @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  projectId: string;

  @Column()
  name: string;

  @Column('text')
  prompt: string;

  @Column()
  folderPath: string;

  @Column({ default: 'created' })
  status: string;

  @Column({ type: 'int', nullable: true })
  frontendPort: number | null;

  @Column({ type: 'int', nullable: true })
  backendPort: number | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

}
