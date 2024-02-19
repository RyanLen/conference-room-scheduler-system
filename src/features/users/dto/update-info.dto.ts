import { ApiProperty } from "@nestjs/swagger";

export class UpdateInfoDto {

  @ApiProperty()
  avatar?: string;

  @ApiProperty()
  username?: string;
}
