import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    required: true,
  })
  @IsNotEmpty({
    message: '用户名不能为空',
  })
  username: string;

  @ApiProperty({
    required: true,
    minLength: 6,
  })
  @IsNotEmpty({
    message: '密码不能为空',
  })
  password: string;
}
