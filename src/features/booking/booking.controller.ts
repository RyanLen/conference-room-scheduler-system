import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PaginateDto, formatTime } from 'src/common/utils';
import { Auth, CurrentUser } from 'src/core/decorators';
import { PaginatePipe } from 'src/core/pipes';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@ApiTags('预约')
@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) { }

  @Get()
  @Auth('sys:booking:query')
  @ApiOperation({ summary: '预订列表' })
  @ApiQuery({
    name: 'username',
    required: false
  })
  @ApiQuery({
    name: 'roomName',
    required: false
  })
  @ApiQuery({
    name: 'location',
    required: false
  })
  @ApiQuery({
    name: 'status',
    required: false
  })
  @ApiQuery({
    name: 'timeRangeStart',
    required: false
  })
  @ApiQuery({
    name: 'timeRangeEnd',
    required: false
  })
  async list(
    @Query(PaginatePipe) paginateDto: PaginateDto,
    @Query('username') username: string,
    @Query('roomName') roomName: string,
    @Query('location') location: string,
    @Query('status') status: string[],
    @Query('timeRangeStart') timeRangeStart: string,
    @Query('timeRangeEnd') timeRangeEnd: string,
  ) {
    return this.bookingService
      .find(paginateDto.currentPage, paginateDto.limit, username,
        roomName, location, status, formatTime(timeRangeStart), formatTime(timeRangeEnd));
  }

  // 获取某个会议室的预订时间，推出可预订时间段
  @Get('time/:roomId')
  @Auth('sys:booking:query')
  async time(@Param('roomId') roomId: number) {
    return this.bookingService.getTime(roomId);
  }

  // 获取会议记录
  @Get('record')
  @Auth('sys:booking:query')
  @ApiOperation({ summary: '会议记录' })
  async record(@CurrentUser('id') userId: number) {
    return this.bookingService.record(userId);
  }

  @Post()
  @Auth('sys:booking:add')
  @ApiOperation({ summary: '添加预订' })
  async booking(@CurrentUser('id') userId: number, @Body() dto: CreateBookingDto) {
    dto.userId = userId
    return await this.bookingService.create(dto)
  }

  @Get("apply/:id")
  @Auth('sys:booking:apply')
  @ApiOperation({ summary: '通过预订' })
  async apply(@Param('id') id: number) {
    return this.bookingService.apply(id);
  }

  @Get("reject/:id")
  @Auth('sys:booking:reject')
  @ApiOperation({ summary: '取消预订' })
  async reject(@Param('id') id: number) {
    return this.bookingService.reject(id);
  }

  @Get("unbind/:id")
  @Auth('sys:booking:unbind')
  @ApiOperation({ summary: '解除预订' })
  async unbind(@Param('id') id: number) {
    return this.bookingService.unbind(id);
  }

  @Get('urge/:id')
  @ApiOperation({ summary: '催办' })
  @Auth()
  async urge(@Param('id') id: number) {
    return this.bookingService.urge(id);
  }

  @Get('note/:id')
  @Auth('sys:booking:query')
  async getNote(@Param('id') id: number) {
    return this.bookingService.getNoteById(id);
  }

  @Put('note/:id')
  @Auth('sys:booking:edit')
  async addNote(@Param('id') id: number, @Body('note') note: string) {
    return this.bookingService.updateNoteById(id, note);
  }
}
