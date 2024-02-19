import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CAPTCHA_PHONE_BIND, CAPTCHA_PHONE_LOGIN, CAPTCHA_PHONE_REGISTER } from 'src/common/constants';
import { Auth } from 'src/core/decorators';
import { RedisService } from '../redis/redis.service';
import { SmsService } from './sms.service';

@ApiTags('短信服务')
@Controller('sms')
export class SmsController {
  constructor(
    private readonly redisService: RedisService,
    private readonly smsService: SmsService
  ) { }

  @Get('bind')
  @Auth()
  @ApiOperation({ summary: '发送绑定手机的验证码' })
  async getBindPhoneCaptcha(@Query('phone') phone: string) {
    // const code = await this.redisService.generateCode(`bind_phone_captcha_${phone}`, 6, 60 * 10)
    const code = await this.redisService.generateCode(CAPTCHA_PHONE_BIND(phone), 6)
    await this.smsService.sendCaptchaCode(phone, code)
    return '发送成功'
  }

  @Get('login')
  async getCaptcha(@Query('phone') phone: string) {
    const code = await this.redisService.generateCode(CAPTCHA_PHONE_LOGIN(phone), 6)
    await this.smsService.sendCaptchaCode(phone, code)
    return '发送成功'
  }

  @Get('register')
  async getRegCaptcha(@Query('phone') phone: string) {
    const code = await this.redisService.generateCode(CAPTCHA_PHONE_REGISTER(phone), 6)
    await this.smsService.sendCaptchaCode(phone, code)
    return '发送成功'
  }
}
