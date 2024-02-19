import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Department {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 100,
    comment: '部门名称',
  })
  name: string;

  @Column({
    type: 'text',
    comment: '部门描述',
    nullable: true
  })
  description: string;

  @CreateDateColumn()
  createTime: Date;

  @UpdateDateColumn()
  updateTime: Date;

  @ManyToOne(() => User, {
    nullable: true
  })
  leader: User;

  @OneToMany(() => User, user => user.department)
  users: User[];
}
