import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

import { ERR_CREDENTIALS_INVALID } from 'src/common/constants/exceptions.cons';
import { createJwtUserPayload } from 'src/common/utils';
import { CustomException } from 'src/core/exceptions';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super();
  }

  public async validate(username: string, password: string) {
    const user = await this.authService.validateUser(username, password);
    if (!user) {
      throw new CustomException("密码不正确", ERR_CREDENTIALS_INVALID)
    }

    return createJwtUserPayload(user);
  }
}
