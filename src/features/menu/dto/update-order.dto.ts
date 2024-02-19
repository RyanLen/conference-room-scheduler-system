import { ApiProperty } from "@nestjs/swagger";

export class UpdateOrderDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  parentId: number;

  @ApiProperty()
  orderNo: number;
}

export class UpdateOrderBatchDto {
  @ApiProperty({ type: UpdateOrderDto, isArray: true })
  batch: UpdateOrderDto[];
}
