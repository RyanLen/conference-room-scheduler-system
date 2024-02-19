import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/core/decorators';
import { DepartmentService } from './department.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@ApiTags('部门管理')
@Controller('department')
export class DepartmentController {
  constructor(
    private readonly departmentService: DepartmentService
  ) { }

  @Get()
  list() {
    return this.departmentService.list();
  }

  @Get('user')
  @Auth('sys:department:query')
  getDepartmentUser(@Query('id') id: number, @Query('username') username: string) {
    return this.departmentService.getDepartmentUser(id, username);
  }

  @Post()
  @Auth('sys:department:add')
  async create(@Body() dto: CreateDepartmentDto) {
    return await this.departmentService.create(dto);
  }

  @Delete(':id')
  @Auth('sys:department:del')
  delete(@Param('id') id: number) {
    return this.departmentService.remove(id);
  }

  @Put(':id')
  @Auth('sys:department:edit')
  update(@Param('id') id: number, @Body() dto: UpdateDepartmentDto) {
    return this.departmentService.update(id, dto);
  }
}
