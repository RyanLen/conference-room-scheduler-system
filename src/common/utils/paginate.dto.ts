import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class PaginateDto {
  @ApiProperty({
    description: '当前页',
    default: 1,
    required: false
  })
  @IsOptional()
  currentPage?: number;

  @ApiProperty({
    description: '每页数量',
    default: 10,
    required: false
  })
  @IsOptional()
  limit?: number;
}
