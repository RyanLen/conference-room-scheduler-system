import { Inject, Injectable } from '@nestjs/common';
import { RedisClientType } from 'redis';
import { ERR_CAPTCHA_EXPIRES, ERR_CAPTCHA_INVALID } from 'src/common/constants';
import { CustomException } from 'src/core/exceptions';

@Injectable()
export class RedisService {
  @Inject('REDIS_CLIENT')
  private redisClient: RedisClientType;

  async get(key: string) {
    return await this.redisClient.get(key);
  }

  async set(key: string, value: string | number, ttl?: number) {
    await this.redisClient.set(key, value);

    if (ttl) {
      await this.redisClient.expire(key, ttl);
    }
  }

  async remove(key: string) {
    await this.redisClient.del(key)
  }

  async generateCode(key: string, len: number, ttl: number = 60 * 5) {
    if (len > 16) len = 16
    const code = Math.random().toString().slice(2, len + 2)
    await this.set(key, code, ttl)
    return code
  }

  async verifyCaptcha(field: string, captchaFromDto: string) {
    const captcha = await this.get(field)
    if (!captcha) {
      throw new CustomException('验证码已失效', ERR_CAPTCHA_EXPIRES)
    }
    if (captchaFromDto !== captcha) {
      throw new CustomException('验证码不正确', ERR_CAPTCHA_INVALID)
    }
  }
}
