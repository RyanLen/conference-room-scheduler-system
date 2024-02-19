import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { RedisClientType } from 'redis';

@Injectable()
export class RequestCountMiddleware implements NestMiddleware {
  @Inject('REDIS_CLIENT')
  private redisClient: RedisClientType;

  async use(req: Request, res: Response, next: NextFunction) {
    const currentDate = new Date().toISOString().split('T')[0]; // 获取当前日期，格式为 'YYYY-MM-DD'
    const currentHour = new Date().getHours().toString(); // 获取当前小时

    // 使用Redis的散列来存储每个小时的访问量
    await this.redisClient.hIncrBy(`requestCounts:${currentDate}`, currentHour, 1);
    next();
  }
}
