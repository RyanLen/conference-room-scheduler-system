import { ApiProperty } from "@nestjs/swagger";

export class UpdateUserInfoDto {

  @ApiProperty()
  avatar?: string;

  @ApiProperty()
  username?: string;

  @ApiProperty()
  password?: string;

  @ApiProperty()
  email?: string;

  @ApiProperty()
  phone?: string;

  @ApiProperty()
  isFrozen?: boolean;

  @ApiProperty()
  department?: number;

  @ApiProperty()
  roles?: number[];
}
