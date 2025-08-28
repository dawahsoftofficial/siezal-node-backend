import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { CreateOrderItemDto } from "./create-order-item.dto";

export class CreateOrderDto {
  @ApiProperty({
    example: "John Doe",
    description: "Full name of user for shipping",
  })
  @IsString()
  userFullName: string;

  @ApiProperty({ example: "+923001234567", description: "User phone number" })
  @IsString()
  userPhone: string;

  @ApiProperty({
    example: "john@example.com",
    description: "User email",
    required: false,
  })
  @IsString()
  userEmail?: string;

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

  @ApiProperty({ example: 100, description: "GST amount" })
  @IsNumber()
  gstAmount: number;

  @ApiPropertyOptional({
    example: 900,
    description:
      "Total Discount Amount for that if discount enabled at that time",
  })
  @IsOptional()
  @IsNumber()
  totalDiscountAmount?: number;

  @ApiProperty({ example: 200, description: "Shipping amount" })
  @IsNumber()
  shippingAmount: number;

  @ApiProperty({ example: 1500, description: "Total order amount" })
  @IsNumber()
  totalAmount: number;

  @ApiProperty({ type: [CreateOrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}
