import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsOptional,
  IsString,
} from "class-validator";

export class UpdateOrderDto {
  @ApiProperty({
    example: "Street 123",
    description: "Shipping address line 1",
  })
  @IsString()
  shippingAddressLine1: string;

  @ApiPropertyOptional({
    example: "Apartment 4B",
    description: "Shipping address line 2",
  })
  @IsString()
  @IsOptional()
  shippingAddressLine2?: string;

  @ApiProperty({ example: "Lahore", description: "Shipping city" })
  @IsString()
  shippingCity: string;

  @ApiPropertyOptional({
    example: "Punjab",
    description: "Shipping state",
    required: false,
  })
  @IsOptional()
  shippingState?: string;

  @ApiProperty({ example: "Pakistan", description: "Shipping country" })
  @IsString()
  shippingCountry: string;

  @ApiProperty({ example: "54000", description: "Postal code" })
  @IsString()
  shippingPostalCode: string;
}
