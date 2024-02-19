import { Client, withUserAccessToken } from '@larksuiteoapi/node-sdk';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { compare } from 'bcrypt';
import { ERR_BIND, ERR_USER_NOT_FOUND } from 'src/common/constants/exceptions.cons';
import { ThirdPartyAuth } from 'src/common/entities/third-party-auth.entity';
import { JwtUserPayload } from 'src/common/interfaces/jwt-user-payload';
import { CustomException } from 'src/core/exceptions';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(ThirdPartyAuth)
    private readonly thirdPartyRepo: Repository<ThirdPartyAuth>,
    @Inject('LARK_CLIENT')
    private readonly larkClient: Client
  ) { }

  async validateUser(username: string, password: string) {
    const user = await this.usersService.findOne({
      where: { username },
      relations: ['roles', 'roles.permissions'],
    });
    if (!user) {
      throw new CustomException("账号不存在", ERR_USER_NOT_FOUND)
    }
    const isValid = await compare(password, user.password);
    return isValid ? user : null;
  }

  async loginByThirdParty(provider: string, providerId: string) {
    const record = await this.thirdPartyRepo.findOne({
      where: {
        provider,
        providerId,
      },
      relations: ['user', 'user.roles', 'user.roles.permissions']
    })

    if (!record) {
      return await this.thirdPartyRepo.save({
        provider,
        providerId
      })
    }

    return record
  }

  async bindThirdParty(userId: number, code: string, type: string) {
    const isBind = await this.thirdPartyRepo.findOneBy({
      user: {
        id: userId
      },
      provider: type
    })
    if (isBind) {
      throw new CustomException('已经绑定过三方账号，请先解绑后再绑定新账号', ERR_BIND)
    }

    const res = await this.larkClient.authen.oidcAccessToken.create({
      data: {
        grant_type: 'authorization_code',
        code,
      },
    })
    const token = res.data.access_token

    if (!token) throw new CustomException('获取token失败，绑定失败', ERR_BIND)

    const info = await this.larkClient.authen.userInfo.get({},
      withUserAccessToken(token)
    )

    const providerId = info.data.open_id

    const existed = await this.thirdPartyRepo.findOneBy({
      provider: type,
      providerId
    })
    if (existed) {
      throw new CustomException('该三方账号已经绑定过账号。若要重新绑定，请先解绑。', ERR_BIND)
    }

    const entity = this.thirdPartyRepo.create({
      provider: type,
      providerId,
      user: {
        id: userId
      }
    })

    try {
      await this.thirdPartyRepo.save(entity)
      return "绑定成功"
    } catch (e) {
      throw new CustomException('绑定失败', ERR_BIND)
    }
  }

  generateJwt(payload: JwtUserPayload, isRefreshToken: boolean = false) {
    return this.jwtService.sign(
      isRefreshToken ? { id: payload.id } : payload,
      {
        expiresIn: this.configService
          .get(isRefreshToken ? 'jwt_refresh_token_expres_time' : 'jwt_access_token_expires_time')
      }
    );
  }

  async unbindThirdParty(id: number, type: string) {
    const res = await this.thirdPartyRepo.delete({
      user: {
        id
      },
      provider: type
    })
    if (res.affected) {
      return '解绑成功'
    } else {
      return '解绑失败'
    }
  }

  async getThirdParty(id: number, type: string) {
    const res = await this.thirdPartyRepo.findOne({
      where: {
        user: {
          id
        },
        provider: type
      }
    })
    return res
  }
}
