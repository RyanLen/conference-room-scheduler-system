// @ts-nocheck
import * as $OpenApi from '@alicloud/openapi-client';
import OpenApiUtil from '@alicloud/openapi-util';
import * as $Util from '@alicloud/tea-util';
import { Inject, Injectable } from '@nestjs/common';
import { SmsTemplate } from './sms.module';

@Injectable()
export class SmsService {
  @Inject('SMS_CLIENT')
  private smsClient;

  @Inject('SMS_TEMPLATE')
  private smsTemplate: SmsTemplate;

  async sendCaptchaCode(phone: string, code: string) {
    await this.send(phone, { code }, this.smsTemplate.CAPTCHA_CODE);
  }

  async notice(phone: string, contnet: { name: string; time: string }) {
    await this.send(phone, contnet, this.smsTemplate.NOTICE);
  }

  private async send(
    phone: string,
    contnet: { [key: string]: any },
    template: string,
  ) {
    const params = new $OpenApi.Params({
      action: 'SendSms',
      version: '2017-05-25',
      protocol: 'HTTPS',
      method: 'POST',
      authType: 'AK',
      style: 'RPC',
      pathname: `/`,
      reqBodyType: 'json',
      bodyType: 'json',
    });
    const queries = {
      PhoneNumbers: phone,
      SignName: '会议预约系统',
      TemplateCode: template,
      TemplateParam: JSON.stringify(contnet),
    };
    const runtime = new $Util.RuntimeOptions({});
    const request = new $OpenApi.OpenApiRequest({
      query: OpenApiUtil.query(queries),
    });
    await this.smsClient.callApi(params, request, runtime);
  }
}
