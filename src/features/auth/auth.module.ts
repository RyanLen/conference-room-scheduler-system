import { Client } from '@larksuiteoapi/node-sdk';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThirdPartyAuth } from 'src/common/entities/third-party-auth.entity';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { FeishuBindStrategy } from './strategies/feishu-bind.strategy';
import { FeishuStrategy } from './strategies/feishu.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { PhoneStrategy } from './strategies/phone.strategy';
import { RefreshStrategy } from './strategies/refresh.strategy';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory(configService: ConfigService) {
        return {
          secret: configService.get('jwt_secret'),
          signOptions: {
            expiresIn: configService.get('jwt_access_token_expires_time'),
          },
        };
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([ThirdPartyAuth]),
    UsersModule,
  ],
  providers: [
    // TODO: feishu 应用其他api
    {
      provide: 'LARK_CLIENT',
      async useFactory(configService: ConfigService) {
        const client = new Client({
          appId: configService.get('feishu_app_id'),
          appSecret: configService.get('feishu_app_secret'),
          disableTokenCache: false
        })
        return client
      },
      inject: [ConfigService]
    },
    AuthService,
    LocalStrategy,
    JwtStrategy,
    RefreshStrategy,
    FeishuStrategy,
    FeishuBindStrategy,
    PhoneStrategy
  ],
  controllers: [AuthController],
})
export class AuthModule { }
