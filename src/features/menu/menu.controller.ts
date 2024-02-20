import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { Auth, CurrentUser } from 'src/core/decorators';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { UpdateOrderBatchDto } from './dto/update-order.dto';
import { MenuService } from './menu.service';

@ApiTags('menu')
@Controller('menu')
export class MenuController {
  constructor(
    private readonly MenuService: MenuService,
  ) { }

  @Get('all')
  @Auth()
  async getMenus(@CurrentUser('roles') userRoles: string[]) {
    return await this.MenuService.findAllWithRoles(userRoles)
  }

  @Post()
  @Auth('sys:menu:add')
  async addMenu(@Body() dto: CreateMenuDto) {
    return await this.MenuService.createMenu(dto)
  }

  @Put(':id')
  @Auth('sys:menu:edit')
  async updateMenu(@Param('id') id: number, @Body() dto: UpdateMenuDto) {
    return await this.MenuService.updateMenu(id, dto)
  }

  @Delete(":id")
  @Auth('sys:menu:del')
  async deleteMenu(@Param('id') id: number) {
    return await this.MenuService.deleteMenu(id)
  }

  @Get(':parentId')
  @ApiParam({ name: 'parentId', type: Number, required: false })
  @Auth()
  async getSubMenu(@Param('parentId') parentId: number = 0, @CurrentUser('roles') userRoles: string[]) {
    return await this.MenuService.getMenu(parentId, userRoles)
  }

  @Get('detail/:id')
  @ApiParam({ name: 'id', type: Number, required: false })
  @Auth('sys:menu:query')
  async getMenuDetail(@Param('id') id: number) {
    return await this.MenuService.getMenuDetail(id)
  }

  @Post('toggleHidden/:id')
  @Auth('sys:menu:edit')
  async toggleHiddenMenu(@Param('id') id: number) {
    return await this.MenuService.toggleHiddenMenu(id)
  }

  @Post('updateOrderBatch')
  @Auth('sys:menu:edit')
  async updateOrderBatch(@Body() dto: UpdateOrderBatchDto) {
    return await this.MenuService.updateOrderBatch(dto)
  }
}
