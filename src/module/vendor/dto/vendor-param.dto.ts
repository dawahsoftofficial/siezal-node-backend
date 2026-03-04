import { ApiProperty } from "@nestjs/swagger";
import { IsInt } from "class-validator";

export class VendorParamDto {
  @ApiProperty({ example: 1, description: "Vendor ID" })
  @IsInt()
  id: number;
}
