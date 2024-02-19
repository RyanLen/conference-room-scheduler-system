import { Controller, Get, Inject, Query } from '@nestjs/common';
import { RedisClientType } from 'redis';

@Controller()
export class AppController {

  constructor(
    @Inject('REDIS_CLIENT')
    private redisClient: RedisClientType
  ) { }

  @Get('request-count')
  async requestCount(@Query('date') date: string = new Date().toISOString().split('T')[0]) {
    const counts = await this.redisClient.hGetAll(`requestCounts:${date}`);
    const hourlyCounts: Record<string, number> = {};
    for (let hour = 0; hour < 24; hour++) {
      hourlyCounts[hour.toString()] = parseInt(counts[hour.toString()] || '0', 10);
    }

    return hourlyCounts;
  }
}
