import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class VendorProductParamDto {
  @ApiProperty({ example: "SKU-001", description: "Product SKU" })
  @IsString()
  sku: string;
}
