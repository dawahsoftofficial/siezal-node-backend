import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsString, Matches } from "class-validator";

export class VendorProductParamDto {
  @ApiProperty({
    example: "SKU-001",
    description: "Single product SKU. Comma-separated values are not accepted.",
  })
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @Matches(/^[^,]+$/, {
    message: "sku must contain a single value without commas",
  })
  sku: string;
}
