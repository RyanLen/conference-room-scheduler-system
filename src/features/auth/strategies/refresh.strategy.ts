import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';

import { ExtractJwt, Strategy } from 'passport-jwt';
import { ERR_CREDENTIALS_INVALID } from 'src/common/constants/exceptions.cons';
import { JwtUserPayload } from 'src/common/interfaces/jwt-user-payload';
import { createJwtUserPayload } from 'src/common/utils';
import { CustomException } from 'src/core/exceptions';
import { UsersService } from 'src/features/users/users.service';

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey: configService.get('jwt_secret'),
    });
  }

  async validate(payload: JwtUserPayload) {
    const user = await this.usersService.findOne({
      where: { id: payload.id },
      relations: ['roles', 'roles.permissions'],
    });
    if (!user) {
      throw new CustomException("非法凭证", ERR_CREDENTIALS_INVALID)
    }
    return createJwtUserPayload(user);
  }
}
