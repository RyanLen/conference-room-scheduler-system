import { ApiProperty } from "@nestjs/swagger";
import { IsOptional } from "class-validator";

export class CreateUserDto {

  @ApiProperty()
  @IsOptional()
  avatar?: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  password: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  @IsOptional()
  isFrozen?: boolean;

  @ApiProperty()
  @IsOptional()
  department?: number;

  @ApiProperty()
  @IsOptional()
  roles?: number[];
}
