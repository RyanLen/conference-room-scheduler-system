import { ApiProperty } from "@nestjs/swagger";

export class UserInfoVo {
  @ApiProperty()
  username: string;

  @ApiProperty()
  nickName: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  avatar: string;

  @ApiProperty()
  phoneNumber: string;

}
