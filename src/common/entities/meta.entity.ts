import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Meta {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  icon: string;

  @Column({ nullable: true })
  expanded: boolean;

  @Column({ default: 0, nullable: true })
  orderNo: number;

  @Column({ nullable: true })
  hidden: boolean;

  @Column({ nullable: true })
  hiddenBreadcrumb: boolean;

  @Column({ nullable: true })
  single: boolean;

  @Column({ nullable: true })
  frameSrc: string;

  @Column({ nullable: true })
  frameBlank: boolean;

  @Column({ nullable: true })
  keepAlive: boolean;
}
