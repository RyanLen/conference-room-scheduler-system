import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({
    required: false
  })
  userId?: number;

  @ApiProperty({
    required: true,
  })
  @IsNotEmpty({
    message: '预订的会议室不能为空',
  })
  roomId: number;

  @ApiProperty({
    required: true,
  })
  @IsNotEmpty({
    message: '开始时间不能为空',
  })
  startTime: string;

  @ApiProperty()
  @IsOptional()
  endTime?: string;
}
