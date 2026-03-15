import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { IsBoolean, IsEmail, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateVendorDto {
  @ApiProperty({ example: "Retail POS Vendor", description: "Vendor display name" })
  @IsString()
  @MaxLength(150)
  name: string;

  @ApiProperty({ example: "retail_pos", description: "Unique vendor code" })
  @IsString()
  @MaxLength(100)
  code: string;

  @ApiPropertyOptional({ example: "John Doe", description: "Vendor contact person" })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  contactName?: string;

  @ApiPropertyOptional({ example: "john@vendor.com", description: "Vendor contact email" })
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  contactEmail?: string;

  @ApiPropertyOptional({ example: true, description: "Whether the vendor is active" })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateVendorDto extends PartialType(CreateVendorDto) {}
