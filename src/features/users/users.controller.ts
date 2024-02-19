import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PaginateDto } from 'src/common/utils';
import { Auth, CurrentUser } from 'src/core/decorators';
import { PaginatePipe } from 'src/core/pipes';
import { MailService } from '../mail/mail.service';
import { RedisService } from '../redis/redis.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateInfoDto } from './dto/update-info.dto';
import { UpdateUserInfoDto } from './dto/update-user-info.dto';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';
import { UsersService } from './users.service';
import { UserListVo } from './vo/user-list.vo';

@ApiTags('用户')
@Controller('user')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly redisService: RedisService,
    private readonly mailerService: MailService
  ) { }

  @Delete(':id')
  @Auth("sys:user:del")
  @ApiOperation({ summary: '删除用户' })
  async remove(@Param('id') id: number) {
    return await this.usersService.remove(id)
  }

  @Put('password')
  @Auth()
  @ApiOperation({ summary: '修改密码' })
  @ApiBody({
    type: UpdateUserPasswordDto
  })
  async updatePassword(@CurrentUser('id') id: number, @Body() dto: UpdateUserPasswordDto) {
    return await this.usersService.updatePassword(id, dto)
  }

  @Put(':id')
  @Auth("sys:user:edit")
  @ApiOperation({ summary: '更新用户信息' })
  async updateInfo(@Param('id') id: number, @Body() dto: UpdateUserInfoDto) {
    return await this.usersService.updateUserInfo(id, dto)
  }

  @Post()
  @Auth('sys:user:add')
  @ApiOperation({ summary: '创建用户' })
  async create(@Body() dto: CreateUserDto) {
    return await this.usersService.createUser(dto)
  }

  @Put()
  @Auth()
  @ApiOperation({ summary: '更新当前用户信息' })
  async updateCurInfo(@CurrentUser('id') id: number, @Body() dto: UpdateInfoDto) {
    return await this.usersService.updateInfo(id, dto)
  }

  @Get('whoami')
  @Auth()
  @ApiOperation({ summary: '获取当前用户信息' })
  async whoami(@CurrentUser('id') id: number) {
    return await this.usersService.getUserInfo(id)
  }

  @Get(':id')
  @Auth("sys:user:view")
  @ApiOperation({ summary: '获取指定用户信息' })
  async getUserInfo(@Param('id') id: number) {
    return await this.usersService.find({ id })
  }

  @Get('freeze')
  @Auth("sys:user:freeze")
  @ApiOperation({ summary: '冻结指定用户信息' })
  @ApiQuery({
    name: 'id',
    description: 'userId',
    type: Number
  })
  @ApiResponse({
    type: String,
    description: 'success'
  })
  async freeze(@Query('id') userId: number) {
    await this.usersService.freezeUserById(userId);
    return 'success';
  }

  @Get()
  @Auth("sys:user:list")
  @ApiOperation({ summary: '获取用户列表' })
  @ApiQuery({
    name: 'username',
    description: '用户名',
    type: String,
    required: false
  })
  @ApiQuery({
    name: 'email',
    description: '邮箱地址',
    type: String,
    required: false
  })
  @ApiQuery({
    name: 'roles',
    description: '角色',
    type: Array<Number>,
    required: false
  })
  @ApiQuery({
    name: 'department',
    description: '部门',
    type: Array<Number>,
    required: false
  })
  @ApiQuery({
    name: 'isFrozen',
    description: '是否冻结',
    type: Boolean,
    required: false
  })
  @ApiResponse({
    type: UserListVo,
    description: '用户列表'
  })
  async list(
    @Query(PaginatePipe) paginateDto: PaginateDto,
    @Query('username') username: string,
    @Query('email') email: string,
    @Query('role') roles: string[],
    @Query('department') department: string[],
    @Query('isFrozen') isFrozen: boolean,
  ) {
    return await this.usersService.findUsers(username, email, roles, department, isFrozen, paginateDto.currentPage, paginateDto.limit);
  }

}



