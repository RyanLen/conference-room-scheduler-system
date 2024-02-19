import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Menu, Role } from 'src/common/entities';
import { Meta } from 'src/common/entities/meta.entity';
import { MenuController } from './menu.controller';
import { MenuService } from './menu.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Menu, Meta, Role]),
  ],
  controllers: [MenuController],
  providers: [
    MenuService,
  ]
})
export class MenuModule { }
