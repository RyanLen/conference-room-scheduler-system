import { ApiProperty } from "@nestjs/swagger";

export class MeetingRoomUsedCountVo {

  @ApiProperty()
  meetingRoomId: string;

  @ApiProperty()
  meetingRoomName: string;

  @ApiProperty()
  usedCount: string;
}
