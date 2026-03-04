import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class VendorLoginDto {
  @ApiProperty({ example: "vendor_abc123", description: "Issued client ID" })
  @IsString()
  clientId: string;

  @ApiProperty({ example: "super-secret", description: "Issued client secret" })
  @IsString()
  clientSecret: string;
}
