import { ApiProperty } from "@nestjs/swagger";

export class UserBookingCountVo {

  @ApiProperty()
  userId: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  bookingCount: string;
}
