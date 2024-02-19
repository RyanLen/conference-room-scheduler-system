import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bullmq';
import { EVENT_ACTIVE, EVENT_BIND, EVENT_BOOKING_NOTICE, EVENT_CLEAR, EVENT_URGE, EVENT_USER_WELCOME, QUEUE_MAIL } from 'src/common/constants';
import { Template } from 'src/common/entities';
import { Repository } from 'typeorm';

interface Email {
  to: string;
  data: any;
}

@Injectable()
export class MailService {

  constructor(
    @InjectQueue(QUEUE_MAIL)
    private readonly mailQueue: Queue,
    @InjectRepository(Template)
    private readonly templateRepo: Repository<Template>,
  ) { }

  @OnEvent(EVENT_USER_WELCOME)
  async welcomeEmail(email: Email) {
    const subject = `欢迎加入会议预约系统: ${email.to}`;

    const template = await this.templateRepo.findOneByOrFail({ name: EVENT_USER_WELCOME })

    return await this.sendMail({
      to: email.to,
      subject,
      template: template.path,
      context: email.data
    });
  }

  @OnEvent(EVENT_ACTIVE)
  async activeEmail(email: Email) {
    const subject = `欢迎加入会议预约系统: ${email.to}`;

    const template = await this.templateRepo.findOneByOrFail({ name: EVENT_ACTIVE })

    return await this.sendMail({
      to: email.to,
      subject,
      template: template.path,
      context: email.data
    })
  }

  @OnEvent(EVENT_BIND)
  async bindEmail(email: Email) {
    const subject = `会议预约系统: ${email.to}`;

    const template = await this.templateRepo.findOneByOrFail({ name: EVENT_BIND })

    return await this.sendMail({
      to: email.to,
      subject,
      template: template.path,
      context: email.data
    })
  }

  @OnEvent(EVENT_URGE)
  async urgeEmail(email: Email) {
    const subject = `会议预约系统: ${email.to}`;

    const template = await this.templateRepo.findOneByOrFail({ name: EVENT_URGE })

    return await this.sendMail({
      to: email.to,
      subject,
      template: template.path,
      context: email.data
    })
  }

  @OnEvent(EVENT_BOOKING_NOTICE)
  async bookingNoticeEmail(email: Email, delay: number = 0) {
    const subject = `会议预约系统: ${email.to}`;

    const template = await this.templateRepo.findOneByOrFail({ name: EVENT_BOOKING_NOTICE })

    await this.mailQueue.add('mailer', {
      to: email.to,
      subject,
      template: template.path,
      context: email.data
    }, { delay })
    return '发送成功'
  }

  @OnEvent(EVENT_CLEAR)
  async clearEmail(email: Email, delay: number = 0) {
    const subject = `会议预约系统: ${email.to}`;

    const template = await this.templateRepo.findOneByOrFail({ name: EVENT_CLEAR })

    await this.mailQueue.add('mailer', {
      to: email.to,
      subject,
      template: template.path,
      context: email.data
    }, { delay })
    return '发送成功'
  }

  async sendMail({ to, subject, template, context }) {
    await this.mailQueue.add('mailer', {
      to,
      subject,
      template,
      context
    })
    return '发送成功'
  }
}
