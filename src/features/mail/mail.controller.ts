import { Body, Controller, Get, Param, Put, Query } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { CAPTCHA_MAIL_BIND, EVENT_BIND } from 'src/common/constants';
import { JwtUserPayload } from 'src/common/interfaces';
import { Auth, CurrentUser } from 'src/core/decorators';
import { RedisService } from '../redis/redis.service';
import { TemplateService } from './template.service';

@ApiTags('邮件服务')
@Controller('email')
export class MailController {

  constructor(
    private readonly redisService: RedisService,
    private readonly templateService: TemplateService,
    private readonly eventEmitter: EventEmitter2,
  ) { }

  @Get('captcha')
  @Auth()
  async sendMail(@CurrentUser() user: JwtUserPayload, @Query('email') email: string) {
    const code = await this.redisService.generateCode(CAPTCHA_MAIL_BIND(email), 6, 60 * 60)
    this.eventEmitter.emit(EVENT_BIND, {
      to: email,
      data: {
        name: user.username,
        code,
      }
    })
    return '验证码已发送'
  }

  @Get('template')
  @Auth('sys:template:query')
  async getTemplateList() {
    return await this.templateService.getTemplateList()
  }

  @Get('template/:name')
  @Auth('sys:template:query')
  async getTemplate(@Param('name') name: string) {
    return await this.templateService.getTemplate(name)
  }

  @Put('template/:name')
  @Auth('sys:template:edit')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        content: {
          type: 'string'
        }
      }
    }
  })
  async updateTemplate(@Param('name') name: string, @Body('content') content: string) {
    return await this.templateService.updateTemplate(name, content)
  }
}
