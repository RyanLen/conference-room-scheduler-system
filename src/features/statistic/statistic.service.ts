import { Inject, Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import * as dayjs from 'dayjs';
import { Booking, Department, MeetingRoom, User } from 'src/common/entities';
import { EntityManager, IsNull, Not } from 'typeorm';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class StatisticService {

  @InjectEntityManager()
  private entityManager: EntityManager;

  @Inject()
  private readonly redisService: RedisService;

  async userBookingCount(startTime: string, endTime: string) {
    const res = await this.entityManager
      .createQueryBuilder(Booking, 'b')
      .select('u.id', 'userId')
      .addSelect('u.username', 'username')
      .leftJoin(User, 'u', 'b.userId = u.id')
      .addSelect('count(1)', 'bookingCount')
      .where('b.startTime between :time1 and :time2', {
        time1: startTime,
        time2: endTime
      })
      .addGroupBy('b.user')
      .getRawMany();
    return res;
  }

  async meetingRoomUsedCount(startTime: string, endTime: string) {
    const res = await this.entityManager
      .createQueryBuilder(Booking, 'b')
      .select('m.id', 'meetingRoomId')
      .addSelect('m.name', 'meetingRoomName')
      .leftJoin(MeetingRoom, 'm', 'b.roomId = m.id')
      .addSelect('count(1)', 'usedCount')
      .where('b.startTime between :time1 and :time2', {
        time1: startTime,
        time2: endTime
      })
      .addGroupBy('b.roomId')
      .getRawMany();
    return res;
  }

  async getManagerList() {
    return await this.entityManager
      .createQueryBuilder(User, 'u')
      .select('u.id', 'id')
      .addSelect('u.username', 'username')
      .leftJoin(Department, 'd', 'u.departmentId = d.id')
      .addSelect('d.name', 'departmentName')
      .where('u.departmentId is not null')
      .limit(5)
      .getRawMany()
  }

  async getStatistic() {
    const CACHE_KEY = 'Statistic'

    let cachedData: any = JSON.parse(await this.redisService.get(CACHE_KEY))

    if (!cachedData) {
      const userCount = await this.entityManager.count(User);
      const managerCount = await this.entityManager.count(User, { where: { department: Not(IsNull()) } });
      const meetingRoomCount = await this.entityManager.count(MeetingRoom);
      const bookingCount = await this.entityManager.count(Booking);

      const thisWeek = dayjs().startOf('week').toDate()
      const lastWeek = dayjs().subtract(7, 'day').startOf('week').toDate()

      // 使用dayjs生成这周的日期数组
      const thisWeekArr = Array.from({ length: 7 }, (_, i) => dayjs().startOf('week').add(i, 'day').format('YYYY-MM-DD'))
      const lastWeekArr = Array.from({ length: 7 }, (_, i) => dayjs().subtract(7, 'day').startOf('week').add(i, 'day').format('YYYY-MM-DD'))
      console.log(thisWeekArr, lastWeekArr);


      const thisWeekBookingCount = await this.entityManager
        .createQueryBuilder(Booking, 'b')
        .select('DATE_FORMAT(b.startTime, "%Y-%m-%d")', 'day')
        .addSelect('count(1)', 'bookingCount')
        .where('b.startTime >= :time', { time: thisWeek })
        .addGroupBy('day')
        .getRawMany();
      const lastWeekBookingCount = await this.entityManager
        .createQueryBuilder(Booking, 'b')
        .select('DATE_FORMAT(b.startTime, "%Y-%m-%d")', 'day')
        .addSelect('count(1)', 'bookingCount')
        .where('b.startTime >= :time1 and b.startTime < :time2', { time1: thisWeek, time2: lastWeek })
        .addGroupBy('day')
        .getRawMany();

      thisWeekArr.forEach((it, idx) => {
        const existed = thisWeekBookingCount.find((item) => item.day === it)
        if (existed) {
          existed.bookingCount = Number(existed.bookingCount)
        } else {
          thisWeekBookingCount.splice(idx, 0, { day: it, bookingCount: 0 })
        }
      })
      lastWeekArr.forEach((it, idx) => {
        const existed = lastWeekBookingCount.find((item) => item.day === it)
        if (existed) {
          existed.bookingCount = Number(existed.bookingCount)
        } else {
          lastWeekBookingCount.splice(idx, 0, { day: it, bookingCount: 0 })
        }
      })

      const meetingRoomUsedCount = await this.entityManager
        .createQueryBuilder(MeetingRoom, 'm')
        // .where('m.isBooked = 1')
        .leftJoin(Booking, 'b', 'b.roomId = m.id')
        .where("b.status = '审批通过'")
        .andWhere('(b.startTime >= :time or b.endTime <= :time)', { time: dayjs().toDate() })
        .getCount()

      const meetingRoomUsedList = await this.entityManager
        .createQueryBuilder(Booking, 'b')
        .select('m.id', 'meetingRoomId')
        .addSelect('m.name', 'meetingRoomName')
        .leftJoin(MeetingRoom, 'm', 'b.roomId = m.id')
        .addSelect('count(1)', 'usedCount')
        .addGroupBy('b.roomId')
        .orderBy('usedCount', 'DESC')
        .limit(5)
        .getRawMany();

      const userBookingCountList = await this.entityManager
        .createQueryBuilder(Booking, 'b')
        .select('u.id', 'userId')
        .addSelect('u.username', 'username')
        .leftJoin(User, 'u', 'b.userId = u.id')
        .addSelect('count(1)', 'bookingCount')
        .addGroupBy('b.user')
        .orderBy('bookingCount', 'DESC')
        .limit(5)
        .getRawMany();

      cachedData = {
        userCount,
        managerCount,
        meetingRoomCount,
        meetingRoomUsedCount,
        bookingCount,
        thisWeekBookingCount,
        lastWeekBookingCount,
        meetingRoomUsedList,
        userBookingCountList,
      }

      this.redisService.set(CACHE_KEY, JSON.stringify(cachedData), 60 * 60 * 12)
    }

    return cachedData
  }
}
