import { ApiProperty, OmitType, PartialType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, Min } from "class-validator";
import { CreateVendorProductDto } from "./vendor-product.dto";

export class UpdateVendorProductDto extends PartialType(
  OmitType(CreateVendorProductDto, ["sku", "branchId"] as const),
) {
  @ApiProperty({
    example: 1,
    description: "Branch ID used with the path SKU to identify the product",
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  branchId: number;
}
