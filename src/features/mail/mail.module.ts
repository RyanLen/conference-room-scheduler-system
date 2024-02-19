import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { BullModule } from '@nestjs/bullmq';
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { QUEUE_MAIL } from 'src/common/constants';
import { Template } from 'src/common/entities';
import { MailController } from './mail.controller';
import { MailService } from './mail.service';
import { MailProcessor } from './queues/mail.processor';
import { TemplateService } from './template.service';

@Global()
@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory(config: ConfigService) {
        return {
          transport: {
            host: config.get('mailer_host'),
            port: Number(config.get('mailer_port')),
            secure: false,
            auth: {
              user: config.get('mailer_auth_user'),
              pass: config.get('mailer_auth_pass'),
            },
          },
          defaults: {
            from: `"${config.get('mailer_name')}" <${config.get('mailer_auth_user')}>`
          },
          template: {
            dir: join(__dirname, 'templates'),
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true
            }
          }
        }
      },
      inject: [ConfigService]
    }),
    BullModule.registerQueueAsync({
      name: QUEUE_MAIL
    }),
    TypeOrmModule.forFeature([Template])
  ],
  providers: [MailService, MailProcessor, TemplateService],
  exports: [MailService],
  controllers: [MailController],
})
export class MailModule { }
