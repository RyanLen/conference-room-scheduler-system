import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import * as dayjs from 'dayjs';
import { EVENT_BOOKING_NOTICE, EVENT_CLEAR, EVENT_URGE } from 'src/common/constants';
import { Booking, MeetingRoom, User } from 'src/common/entities';
import { Between, Brackets, EntityManager, In, Like, Repository } from 'typeorm';
import { MailService } from '../mail/mail.service';
import { RedisService } from '../redis/redis.service';
import { SmsService } from '../sms/sms.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingService {

  @InjectEntityManager()
  private entityManager: EntityManager;

  @Inject(RedisService)
  private redisService: RedisService;

  @Inject(MailService)
  private emailService: MailService;

  @Inject(SmsService)
  private smsService: SmsService;

  @InjectRepository(Booking)
  private readonly bookingRepo: Repository<Booking>

  @InjectRepository(MeetingRoom)
  private readonly roomRepo: Repository<MeetingRoom>

  @Inject()
  private readonly eventEmitter: EventEmitter2

  async initData() {
    const user1 = await this.entityManager.findOneBy(User, {
      id: 1
    });
    const user2 = await this.entityManager.findOneBy(User, {
      id: 2
    });

    const room1 = await this.entityManager.findOneBy(MeetingRoom, {
      id: 3
    });
    const room2 = await await this.entityManager.findOneBy(MeetingRoom, {
      id: 6
    });

    const booking1 = new Booking();
    booking1.room = room1;
    booking1.user = user1;
    booking1.startTime = new Date();
    booking1.endTime = new Date(Date.now() + 1000 * 60 * 60);

    await this.entityManager.save(Booking, booking1);

    const booking2 = new Booking();
    booking2.room = room2;
    booking2.user = user2;
    booking2.startTime = new Date();
    booking2.endTime = new Date(Date.now() + 1000 * 60 * 60);

    await this.entityManager.save(Booking, booking2);

    const booking3 = new Booking();
    booking3.room = room1;
    booking3.user = user2;
    booking3.startTime = new Date();
    booking3.endTime = new Date(Date.now() + 1000 * 60 * 60);

    await this.entityManager.save(Booking, booking3);

    const booking4 = new Booking();
    booking4.room = room2;
    booking4.user = user1;
    booking4.startTime = new Date();
    booking4.endTime = new Date(Date.now() + 1000 * 60 * 60);

    await this.entityManager.save(Booking, booking4);
  }

  async create(dto: CreateBookingDto) {
    const user = await this.entityManager.findOneBy(User, { id: dto.userId })
    const room = await this.entityManager.findOneBy(MeetingRoom, { id: dto.roomId })
    const booking = new Booking();
    booking.user = user;
    booking.room = room;
    booking.startTime = new Date(dto.startTime);
    booking.endTime = dto.endTime ? new Date(dto.endTime) : new Date(+booking.startTime + 1000 * 60 * 60)

    const existed = await this.entityManager
      .createQueryBuilder(Booking, 'b')
      .leftJoin(MeetingRoom, 'r', 'b.roomId = r.id')
      .where('r.id = :id', { id: room.id })
      .andWhere("b.status = '审批通过'")
      .andWhere(
        new Brackets(qb => {
          qb.where('b.startTime between :time1 and :time2', {
            time1: booking.startTime,
            time2: booking.endTime
          })
            .orWhere('b.endTime between :time1 and :time2', {
              time1: booking.startTime,
              time2: booking.endTime
            })
        })
      )
      .getOne()

    if (existed) {
      throw new BadRequestException('该会议室在这个时段已经被预订')
    }
    const condition: Record<string, any> = {};
    condition.roomId = room.id
    condition.startTime = Between(booking.startTime, booking.endTime)
    condition.endTime = Between(booking.startTime, booking.endTime)
    return await this.entityManager.save(Booking, booking);
  }

  async find(pageNo: number, pageSize: number, username: string, roomName: string, location: string, status: string[], timeRangeStart: string, timeRangeEnd: string) {
    const skipCount = (pageNo - 1) * pageSize;

    const condition: Record<string, any> = {};

    if (username) {
      condition.user = {
        username: Like(`%${username}%`)
      }
    }

    if (roomName) {
      condition.room = {
        name: Like(`%${roomName}%`)
      }
    }

    if (location) {
      if (!condition.room) {
        condition.room = {}
      }
      condition.room.location = Like(`%${location}%`)
    }

    if (status) {
      condition.status = Array.isArray(status) ? In(status) : status
    }

    console.log("timeRangeStart", timeRangeStart, typeof timeRangeStart)
    if (timeRangeStart) {
      // 如果没有结束时间，默认结束时间为开始时间一小时后
      if (!timeRangeEnd) {
        timeRangeEnd = dayjs(timeRangeStart).add(1, 'hour').format('YYYY-MM-DD HH:mm')
      }
      condition.startTime = Between(timeRangeStart, timeRangeEnd)
    }

    const [list, totalCount] = await this.entityManager.findAndCount(Booking, {
      where: condition,
      relations: {
        user: true,
        room: true,
      },
      skip: skipCount,
      take: pageSize
    });

    return {
      list,
      totalCount
    }
  }

  async getUpcomingMeetings(bookingTimeRangeStart: number, bookingTimeRangeEnd?: number) {

    const condition: Record<string, any> = {
      status: '审批通过',
      reminderSent: false
    };

    if (bookingTimeRangeStart) {
      if (!bookingTimeRangeEnd) {
        bookingTimeRangeEnd = bookingTimeRangeStart + 60 * 60 * 1000
      }
      condition.startTime = Between(new Date(+bookingTimeRangeStart), new Date(+bookingTimeRangeEnd))
    }

    const [bookings, totalCount] = await this.entityManager.findAndCount(Booking, {
      where: condition,
      relations: {
        user: true,
        room: true,
      }
    });

    return {
      bookings,
      totalCount
    }
  }

  async setReminded(id: number) {
    await this.entityManager.update(Booking, { id }, { reminderSent: true })
  }

  async apply(id: number) {
    await this.entityManager.update(Booking, {
      id
    }, {
      status: '审批通过'
    });

    const booking = await this.bookingRepo.findOne({
      where: { id },
      relations: {
        user: true,
        room: true
      }
    })

    const room = await this.roomRepo.findOne({
      where: { id: booking.room.id },
      relations: {
        manager: true
      }
    })

    const endTime = booking.endTime
    let delayEnd = dayjs(endTime).diff()
    if (delayEnd > 0 && room?.manager?.email) {
      const options = {
        to: room.manager.email,
        data: {
          managerName: room.manager.username,
          roomName: booking.room.name,
          location: booking.room.location,
          duration: dayjs(booking.endTime).diff(booking.startTime, 'minute') + '分钟',
        },
      }

      this.eventEmitter.emit(EVENT_CLEAR, options, delayEnd)
    }

    const startTime = booking.startTime
    let delay = dayjs(startTime).diff()
    if (delay > 0 && delay >= 1000 * 60 * 10) {
      delay -= 1000 * 60 * 10
    }

    if (delay > 0) {
      if (booking.user.phoneNumber) {
        this.smsService.notice(booking.user.phoneNumber, {
          name: booking.user.username,
          time: `${dayjs(booking.startTime).format('YYYY-MM-DD HH:mm')} - ${dayjs(booking.endTime).format('HH:mm')}`
        })
      }

      const options = {
        to: booking.user.email,
        data: {
          userName: booking.user.username,
          roomName: booking.room.name,
          location: booking.room.location,
          time: `${dayjs(booking.startTime).format('YYYY-MM-DD HH:mm')} - ${dayjs(booking.endTime).format('HH:mm')}`,
          duration: dayjs(booking.endTime).diff(booking.startTime, 'hour'),
        },
      }

      this.eventEmitter.emit(EVENT_BOOKING_NOTICE, options, delay)
    }

    return 'success'
  }

  async reject(id: number) {
    await this.entityManager.update(Booking, {
      id
    }, {
      status: '审批驳回'
    });
    return 'success'
  }

  async unbind(id: number) {
    await this.entityManager.update(Booking, {
      id
    }, {
      status: '已解除'
    });
    return 'success'
  }

  async urge(id: number) {
    const flag = await this.redisService.get('urge_' + id);

    if (flag) {
      return '半小时内只能催办一次，请耐心等待';
    }

    // 获取room的负责人
    const bookingRecord = await this.bookingRepo.findOne({
      where: { id },
      relations: {
        user: true,
        room: true
      }
    })

    const room = await this.roomRepo.findOne({
      where: { id: bookingRecord.room.id },
      relations: {
        manager: true
      }
    })

    let admin = room.manager;
    let email = room.manager.email;

    this.eventEmitter.emit(EVENT_URGE, {
      to: email,
      data: {
        adminName: admin.username,
        roomName: bookingRecord.room.name,
        bookerName: bookingRecord.user.username,
        bookingDate: dayjs(bookingRecord.startTime).format('YYYY-MM-DD'),
        bookingTime: dayjs(bookingRecord.startTime).format('HH:mm'),
        bookingDuration: dayjs(bookingRecord.endTime).diff(bookingRecord.startTime, 'hour'),
      }
    })

    this.redisService.set('urge_' + id, 1, 60 * 30);
  }

  async getTime(roomId: number) {
    const bookings = await this.entityManager.find(Booking, {
      where: {
        room: {
          id: roomId
        },
        status: '审批通过'
      }
    });

    const timeMap = bookings.reduce((acc, booking) => {
      const date = dayjs(booking.startTime).format('YYYY-MM-DD');
      const startHour = dayjs(booking.startTime).hour();
      const endHour = dayjs(booking.endTime).hour();

      if (!acc[date]) {
        acc[date] = { hour: [] };
      }

      for (let hour = startHour; hour <= endHour; hour++) {
        if (!acc[date].hour.includes(hour)) {
          acc[date].hour.push(hour);
        }
      }

      return acc;
    }, {});

    // 最后一步，将 hour 数组排序
    for (const date in timeMap) {
      timeMap[date].hour = timeMap[date].hour.sort((a, b) => a - b);
    }

    return timeMap;
  }

  async record(userId: number) {
    console.log("===============userId", userId)
    return await this.entityManager.find(Booking, {
      where: {
        user: {
          id: userId
        }
      },
      relations: {
        room: true,
      },
      // 时间倒序
      order: {
        createTime: 'DESC'
      },
      take: 10
    });
  }

  async getNoteById(id: number) {
    const booking = await this.entityManager.findOne(Booking, {
      where: {
        id
      }
    });

    return booking.note;
  }

  async updateNoteById(id: number, note: string) {
    return await this.entityManager.update(Booking, {
      id
    }, {
      note
    });
  }
}
