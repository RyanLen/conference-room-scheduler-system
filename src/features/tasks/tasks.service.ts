import { Injectable } from '@nestjs/common';
import { BookingService } from '../booking/booking.service';
import { MailService } from '../mail/mail.service';
import { SmsService } from '../sms/sms.service';

@Injectable()
export class TasksService {
  constructor(
    private readonly mailerService: MailService,
    private readonly bookingService: BookingService,
    private readonly smsService: SmsService
  ) { }

  // @Cron('* * 1 * * *')
  async notify() {
    const list = await this.bookingService.getUpcomingMeetings(+new Date())

    list.bookings.forEach(async (booking) => {
      const { startTime, endTime } = booking
      const { username, email, phoneNumber } = booking.user
      const { name, location } = booking.room

      // await this.mailerService.sendMail({
      //   to: email,
      //   subject: '会议预约系统',
      //   html: `<p>👋你好${username},<br>
      //   你预订的${name}会议室即将开始,<br>
      //   时间：${new Date(startTime).toLocaleString()} - ${new Date(endTime).toLocaleString()},<br>
      //   地点：${location},<br>
      //   记得参加会议</p>`
      // })

      await this.smsService.notice(phoneNumber, {
        name: username,
        time: new Date(startTime).toLocaleString()
      })
      await this.bookingService.setReminded(booking.id)
    })
  }
}
