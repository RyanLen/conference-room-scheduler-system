import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { createJwtUserPayload } from 'src/common/utils';
import { AuthService } from '../auth.service';
import { Strategy } from './Strategy';

@Injectable()
export class FeishuStrategy extends PassportStrategy(Strategy, 'feishu') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService
  ) {
    super({
      clientID: configService.get('feishu_app_id'),
      clientSecret: configService.get('feishu_app_secret'),
      // callbackURL: 'http://127.0.0.1:3000/auth/feishu/qrlogin',
      callbackURL: 'http://127.0.0.1:3002/login',
      appType: 'internal'
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any): Promise<any> {
    const record = await this.authService.loginByThirdParty('feishu', profile.open_id)
    // if (!record.user) {
    //   throw new CustomException('没有绑定用户,请绑定已有用户', ERR_USER_UNBOUND, record)
    // }
    return createJwtUserPayload(record.user)
  }
}
