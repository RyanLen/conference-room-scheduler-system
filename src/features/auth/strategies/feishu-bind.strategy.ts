import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from './Strategy';

@Injectable()
export class FeishuBindStrategy extends PassportStrategy(Strategy, 'feishu-bind') {
  constructor(
    private readonly configService: ConfigService
  ) {
    super({
      clientID: configService.get('feishu_app_id'),
      clientSecret: configService.get('feishu_app_secret'),
      callbackURL: 'http://127.0.0.1:3000/auth/feishu/bind',
      appType: 'internal'
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any): Promise<any> {
    return profile
  }
}
