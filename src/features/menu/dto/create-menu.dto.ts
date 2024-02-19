import { ApiProperty } from "@nestjs/swagger";

export class CreateMetaDto {
  @ApiProperty()
  title?: string;

  @ApiProperty()
  icon?: string;

  @ApiProperty()
  expanded?: boolean;

  @ApiProperty()
  hidden?: boolean;

  @ApiProperty()
  hiddenBreadcrumb?: boolean;

  @ApiProperty()
  single?: boolean;

  @ApiProperty()
  keepAlive?: boolean;

  @ApiProperty()
  frameSrc?: string;

  @ApiProperty()
  frameBlank?: boolean;
}

export class CreateMenuDto {
  @ApiProperty()
  path: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  component: string;

  @ApiProperty()
  redirect?: string;

  @ApiProperty()
  parentId?: number;

  @ApiProperty()
  roles: number[];

  @ApiProperty({ type: CreateMetaDto })
  meta?: CreateMetaDto;
}
