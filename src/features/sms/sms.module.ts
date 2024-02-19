// @ts-ignore
import OpenApi, * as $OpenApi from '@alicloud/openapi-client';
import { BullModule } from '@nestjs/bullmq';
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QUEUE_SMS } from 'src/common/constants';
import { SmsController } from './sms.controller';
import { SmsService } from './sms.service';

export interface SmsTemplate {
  CAPTCHA_CODE: string;
  NOTICE: string;
}

@Global()
@Module({
  imports: [
    BullModule.registerQueueAsync({
      name: QUEUE_SMS
    }),
  ],
  providers: [
    SmsService,
    {
      provide: 'SMS_CLIENT',
      async useFactory(configService: ConfigService) {
        const config = new $OpenApi.Config({
          accessKeyId: configService.get('sms_access_key_id'),
          accessKeySecret: configService.get('sms_access_key_secret'),
        });
        config.endpoint = configService.get('sms_endpoint');
        const client = new OpenApi(config);
        return client;
      },
      inject: [ConfigService],
    },
    {
      provide: 'SMS_TEMPLATE',
      useFactory(configService: ConfigService): SmsTemplate {
        return {
          CAPTCHA_CODE: configService.get('sms_template_captcha_code'),
          NOTICE: configService.get('sms_template_notice'),
        };
      },
      inject: [ConfigService],
    },
  ],
  exports: [SmsService],
  controllers: [SmsController],
})
export class SmsModule { }
