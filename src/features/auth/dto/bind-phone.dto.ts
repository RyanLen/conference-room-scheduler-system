import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsPhoneNumber } from 'class-validator';

export class BindPhoneDto {
  @ApiProperty({
    required: true,
  })
  @IsNotEmpty({
    message: '手机号不能为空',
  })
  @IsPhoneNumber("CN")
  phone: string;

  @ApiProperty({
    required: true,
    minLength: 6,
  })
  @IsNotEmpty({
    message: '验证码不能为空',
  })
  captcha: string;
}
