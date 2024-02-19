import { ApiProperty } from '@nestjs/swagger';
import { IsMobilePhone, IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserByPhoneDto {
  @IsNotEmpty({
    message: '用户名不能为空',
  })
  @ApiProperty()
  username: string;

  @IsNotEmpty({
    message: '密码不能为空',
  })
  @MinLength(6, {
    message: '密码不能少于 6 位',
  })
  @ApiProperty({
    minLength: 6,
  })
  password: string;

  @IsNotEmpty({
    message: '手机号不能为空',
  })
  @IsMobilePhone("zh-CN")
  @ApiProperty()
  phone: string;

  @IsNotEmpty({
    message: '验证码不能为空'
  })
  @ApiProperty()
  captcha: string;
}
