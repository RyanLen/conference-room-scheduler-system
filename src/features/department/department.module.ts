import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Department, User } from 'src/common/entities';
import { DepartmentController } from './department.controller';
import { DepartmentService } from './department.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Department, User]),
  ],
  controllers: [DepartmentController],
  providers: [DepartmentService]
})
export class DepartmentModule { }
