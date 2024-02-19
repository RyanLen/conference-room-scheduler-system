import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PaginateDto } from 'src/common/utils';
import { Auth } from 'src/core/decorators';
import { PaginatePipe } from 'src/core/pipes';
import { CreateMeetingRoomDto } from './dto/create-meeting-room.dto';
import { UpdateMeetingRoomDto } from './dto/update-meeting-room.dto';
import { MeetingRoomService } from './meeting-room.service';
import { MeetingRoomListVo } from './vo/meeting-room-list.vo';
import { MeetingRoomVo } from './vo/meeting-room.vo';

@ApiTags('会议室模块')
@Controller('meeting-room')
export class MeetingRoomController {
  constructor(private readonly meetingRoomService: MeetingRoomService) { }

  @Get('equipment')
  @ApiOperation({ summary: '获取设备列表' })
  async getEquipmentList(@Query(PaginatePipe) paginateDto: PaginateDto) {
    return await this.meetingRoomService.getEquipmentList(paginateDto.currentPage, paginateDto.limit);
  }

  @Post()
  @Auth('sys:meeting:add')
  @ApiOperation({ summary: '创建一个会议室' })
  @ApiBody({
    type: CreateMeetingRoomDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '会议室名字已存在'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: MeetingRoomVo
  })
  async create(@Body() meetingRoomDto: CreateMeetingRoomDto) {
    return await this.meetingRoomService.create(meetingRoomDto);
  }

  @Put(':id')
  @Auth('sys:meeting:edit')
  @ApiOperation({ summary: '更新指定会议室信息' })
  @ApiBody({
    type: UpdateMeetingRoomDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '会议室不存在'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'success'
  })
  async update(@Param("id") id: number, @Body() meetingRoomDto: UpdateMeetingRoomDto) {
    return await this.meetingRoomService.update(id, meetingRoomDto);
  }

  @Get(':id')
  @Auth('sys:meeting:query')
  @ApiOperation({ summary: '获取指定会议室信息' })
  @ApiParam({
    name: 'id',
    type: Number,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'success',
    type: MeetingRoomVo
  })
  async find(@Param('id') id: number) {
    return await this.meetingRoomService.findById(id);
  }

  @Delete(':id')
  @Auth('sys:meeting:del')
  @ApiOperation({ summary: '删除指定会议室' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'id'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'success'
  })
  async delete(@Param('id') id: number) {
    return await this.meetingRoomService.delete(id);
  }

  @Get()
  @Auth('sys:meeting:query')
  @ApiOperation({ summary: '获取会议室列表' })
  @ApiQuery({
    name: 'name',
    type: String,
    required: false
  })
  @ApiQuery({
    name: 'capacity',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'equipment',
    type: String,
    required: false
  })
  @ApiQuery({
    name: 'location',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'isBooked',
    type: Number,
    required: false
  })
  @ApiResponse({
    type: MeetingRoomListVo
  })
  async list(
    @Query(PaginatePipe) paginateDto: PaginateDto,
    @Query('name') name: string,
    @Query('capacity') capacity: number,
    @Query('equipment') equipment: string,
    @Query('isBooked') isBooked: number,
    @Query('location') location: string,
  ) {
    return await this.meetingRoomService.find(paginateDto.currentPage, paginateDto.limit, name, capacity, equipment, location, isBooked);
  }
}
