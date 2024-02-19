import { ApiProperty } from '@nestjs/swagger';

export class RefreshDto {
  @ApiProperty({
    required: true
  })
  refreshToken: string;
}
