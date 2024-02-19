import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateDepartmentDto {
  @ApiProperty()
  @IsNotEmpty({
    message: '部门名不能为空',
  })
  name: string;

  @ApiProperty({
    required: false,
  })
  description: string;

  @ApiProperty({
    required: false,
  })
  leaderId: number;
}
