import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn
} from 'typeorm';
import { Meta } from './meta.entity';
import { Role } from './role.entity';

@Entity({
  name: 'menu',
})
export class Menu {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  path: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  component: string;

  @Column({ nullable: true })
  redirect: string;

  @OneToOne(() => Meta, { onDelete: 'CASCADE' })
  @JoinColumn()
  meta: Meta;

  @OneToMany(() => Menu, menu => menu.parent, { nullable: true })
  children: Menu[];

  @ManyToOne(() => Menu, menu => menu.children, { nullable: true })
  parent: Menu

  @ManyToMany(() => Role, role => role.menus)
  @JoinTable()
  roles: Role[];
}
