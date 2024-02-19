import { Body, Controller, Get, HttpStatus, Post, Query, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtUserPayload } from 'src/common/interfaces';
import { Auth, CurrentUser } from 'src/core/decorators';
import { FeishuAuthGuard, LocalAuthGuard, PhoneAuthGuard } from 'src/core/guards';
import { RefreshAuthGuard } from 'src/core/guards/refresh-auth.guard';
import { CreateUserByMailDto } from '../users/dto/create-user-by-mail.dto';
import { CreateUserByPhoneDto } from '../users/dto/create-user-by-phone.dto';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { BindEmailDto } from './dto/bind-email.dto';
import { BindPhoneDto } from './dto/bind-phone.dto';
import { LoginPhoneDto } from './dto/login-phone.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { LoginVo } from './vo/login.vo';

@ApiTags('令牌授权')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly eventEmitter: EventEmitter2,
    private readonly configService: ConfigService,
  ) { }

  @ApiOperation({ summary: '注册账号' })
  @ApiBody({ type: CreateUserByMailDto })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '验证码已失效/验证码不正确/用户已存在',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '注册成功/失败',
    type: String,
  })
  @Post('register/mail')
  async registerByMail(@Body() dto: CreateUserByMailDto) {
    return await this.usersService.createByMail(dto);
  }

  @ApiOperation({ summary: '注册账号' })
  @ApiBody({ type: CreateUserByPhoneDto })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '验证码已失效/验证码不正确/用户已存在',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '注册成功/失败',
    type: String,
  })
  @Post('register/phone')
  async registerByPhone(@Body() dto: CreateUserByPhoneDto) {
    return await this.usersService.createByPhone(dto);
  }

  @Get("active")
  async activeAccount(@Query("mail") mail: string, @Query("token") token: string, @Res() res: Response) {
    const flag = await this.usersService.activeAccount(mail, token)
    if (flag) {
      res.redirect(`${this.configService.get('frontend_base_url')}/login`)
    } else {
      return '激活失败'
    }
  }

  @ApiOperation({ summary: '用户登陆' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '用户不存在/密码错误',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'token',
    type: LoginVo,
  })
  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(@CurrentUser() user) {
    return {
      accessToken: this.authService.generateJwt(user),
      refreshToken: this.authService.generateJwt(user, true),
    };
  }

  @Post('login/phone')
  @ApiBody({ type: LoginPhoneDto })
  @UseGuards(PhoneAuthGuard)
  async loginByPhone(@CurrentUser() user) {
    return {
      accessToken: this.authService.generateJwt(user),
      refreshToken: this.authService.generateJwt(user, true),
    };
  }

  @ApiOperation({ summary: '刷新 token' })
  @ApiBody({ type: RefreshDto })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'token 已失效，请重新登录',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '刷新成功',
    type: LoginVo,
  })
  @Post('/refresh')
  @UseGuards(RefreshAuthGuard)
  async refresh(@CurrentUser() user) {
    return {
      accessToken: this.authService.generateJwt(user),
      refreshToken: this.authService.generateJwt(user, true),
    };
  }

  @Get('feishu/qrlogin')
  @UseGuards(FeishuAuthGuard)
  async feishuLogin(@CurrentUser() user) {
    return {
      accessToken: this.authService.generateJwt(user),
      refreshToken: this.authService.generateJwt(user, true),
    };
  }

  @Get('bind')
  @Auth()
  async feishuBind(@CurrentUser() user, @Query('code') code: string, @Query('type') type: string) {
    return await this.authService.bindThirdParty(user.id, code, type)
  }

  @Get('unbind')
  @Auth()
  async feishuUnbind(@CurrentUser('id') id: number, @Query('type') type: string) {
    return await this.authService.unbindThirdParty(id, type)
  }

  @Get('thirdparty')
  @Auth()
  async getThirdParty(@CurrentUser('id') id: number, @Query('type') type: string) {
    return await this.authService.getThirdParty(id, type)
  }

  @Post('bind/email')
  @Auth()
  async bindMail(@CurrentUser() user: JwtUserPayload, @Body() dto: BindEmailDto) {
    return await this.usersService.bindEmail(user, dto)
  }

  @Post('bind/phone')
  @Auth()
  async bindPhone(@CurrentUser() user: JwtUserPayload, @Body() dto: BindPhoneDto) {
    return await this.usersService.bindPhone(user, dto)
  }
}
