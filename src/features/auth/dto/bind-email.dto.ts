import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class BindEmailDto {
  @ApiProperty({
    required: true,
  })
  @IsNotEmpty({
    message: '邮箱不能为空',
  })
  @IsEmail({}, { message: '邮箱格式不正确' })
  email: string;

  @ApiProperty({
    required: true,
    minLength: 6,
  })
  @IsNotEmpty({
    message: '验证码不能为空',
  })
  captcha: string;
}
