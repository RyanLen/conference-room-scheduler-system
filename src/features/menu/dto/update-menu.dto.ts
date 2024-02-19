import { ApiProperty } from "@nestjs/swagger";

export class UpdateMetaDto {
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

export class UpdateMenuDto {
  @ApiProperty()
  path: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  component: string;

  @ApiProperty()
  redirect?: string;

  @ApiProperty()
  roles: number[];

  @ApiProperty({ type: UpdateMetaDto })
  meta: UpdateMetaDto;
}
