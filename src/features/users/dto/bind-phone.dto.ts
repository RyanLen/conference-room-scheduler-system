import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsPhoneNumber } from "class-validator";

export class BindPhoneDto {
  @IsNotEmpty({
    message: '手机号不能为空',
  })
  @IsPhoneNumber("CN", { message: '不是合法的手机号码' })
  @ApiProperty()
  phone: string;

  @IsNotEmpty({
    message: '验证码不能为空'
  })
  @ApiProperty()
  captcha: string;
}
