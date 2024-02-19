import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { CAPTCHA_PHONE_LOGIN } from 'src/common/constants';

import { createJwtUserPayload } from 'src/common/utils';
import { RedisService } from 'src/features/redis/redis.service';
import { UsersService } from 'src/features/users/users.service';

@Injectable()
export class PhoneStrategy extends PassportStrategy(Strategy, 'phone') {
  constructor(
    private readonly redisService: RedisService,
    private readonly usersService: UsersService
  ) {
    super({
      usernameField: 'phone',
      passwordField: 'captcha'
    });
  }

  public async validate(phone: string, captcha: string) {
    await this.redisService.verifyCaptcha(CAPTCHA_PHONE_LOGIN(phone), captcha)
    const user = await this.usersService.findOne({
      where: {
        phoneNumber: phone
      },
      relations: ['roles', 'roles.permissions'],
    })
    return createJwtUserPayload(user);
  }
}
