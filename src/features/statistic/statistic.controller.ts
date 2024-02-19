import { Controller, Get, HttpStatus, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/core/decorators';
import { StatisticService } from './statistic.service';
import { MeetingRoomUsedCountVo } from './vo/meeting-room-used-count.vo';
import { UserBookingCountVo } from './vo/user-booking-count.vo';

@ApiTags('统计模块')
@Controller('statistic')
export class StatisticController {
  constructor(private readonly statisticService: StatisticService) { }

  @Get('userBookingCount')
  @Auth()
  @ApiOperation({ summary: '统计预订次数' })
  @ApiQuery({
    name: 'startTime',
    type: String,
    description: '开始时间'
  })
  @ApiQuery({
    name: 'endTime',
    type: String,
    description: '结束时间'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: UserBookingCountVo
  })
  async userBookignCount(@Query('startTime') startTime: string, @Query('endTime') endTime) {
    return this.statisticService.userBookingCount(startTime, endTime);
  }

  @Get('meetingRoomUsedCount')
  @Auth()
  @ApiOperation({ summary: '统计预订会议用途' })
  @ApiQuery({
    name: 'startTime',
    type: String,
    description: '开始时间'
  })
  @ApiQuery({
    name: 'endTime',
    type: String,
    description: '结束时间'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: MeetingRoomUsedCountVo
  })
  async meetingRoomUsedCount(@Query('startTime') startTime: string, @Query('endTime') endTime) {
    return this.statisticService.meetingRoomUsedCount(startTime, endTime);
  }

  @Get('getManagerList')
  @Auth()
  @ApiOperation({ summary: '获取管理员列表' })
  async getManagerList() {
    return this.statisticService.getManagerList();
  }

  @Get()
  @Auth()
  @ApiOperation({ summary: '获取统计信息' })
  async getStatistic() {
    return this.statisticService.getStatistic();
  }
}
