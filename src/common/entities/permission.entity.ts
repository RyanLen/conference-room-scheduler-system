import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
  name: 'permissions',
})
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    comment: '权限代码',
  })
  code: string;

  @Column({
    comment: '权限描述',
  })
  description: string;
}
