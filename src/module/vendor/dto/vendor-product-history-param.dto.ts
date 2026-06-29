import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, Min } from "class-validator";

export class VendorProductHistoryParamDto {
  @ApiProperty({ example: 1, description: "Product ID" })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  productId: number;
}
