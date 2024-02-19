import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { MeetingRoom } from "./meeting-room.entity";
import { User } from "./user.entity";

@Entity()
export class Booking {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    comment: '会议开始时间'
  })
  startTime: Date;

  @Column({
    comment: '会议结束时间'
  })
  endTime: Date;

  @Column({
    length: 20,
    comment: '状态（申请中、审批通过、审批驳回、已解除）',
    default: '申请中'
  })
  status: string;

  @Column({
    type: 'longtext',
    comment: '备注',
    nullable: true
  })
  note: string;

  @Column({
    default: false,
    comment: '是否已经提醒'
  })
  reminderSent: boolean;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => MeetingRoom)
  room: MeetingRoom;

  @CreateDateColumn({
    comment: '创建时间'
  })
  createTime: Date;

  @UpdateDateColumn({
    comment: '更新时间'
  })
  updateTime: Date;
}
