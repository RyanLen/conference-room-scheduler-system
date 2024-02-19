import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./user.entity";

@Entity()
export class MeetingRoom {

  @PrimaryGeneratedColumn({
    comment: '会议室ID'
  })
  id: number;

  @Column({
    length: 50,
    comment: '会议室名字'
  })
  name: string;

  @Column({
    comment: '会议室容量'
  })
  capacity: number;

  @Column({
    length: 50,
    comment: '会议室位置'
  })
  location: string;

  @Column({
    comment: '设备清单'
  })
  equipment: string;

  @Column({
    length: 100,
    comment: '描述',
    default: ''
  })
  description: string;

  @Column({
    comment: '是否被预订',
    default: false
  })
  isBooked: boolean;

  @CreateDateColumn({
    comment: '创建时间'
  })
  createTime: Date;

  @UpdateDateColumn({
    comment: '更新时间'
  })
  updateTime: Date;

  @ManyToOne(() => User, {
    nullable: true
  })
  manager: User;
}
