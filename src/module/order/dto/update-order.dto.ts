import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEnum,
  IsOptional,
  IsString,
} from "class-validator";
import { EOrderStatus } from "src/common/enums/order-status.enum";

export class UpdateOrderDto {
  @ApiProperty({
    example: "Street 123",
    description: "Shipping address line 1",
  })
  @IsString()
  @IsOptional()
  shippingAddressLine1?: string;

  @ApiPropertyOptional({
    example: "Apartment 4B",
    description: "Shipping address line 2",
  })
  @IsString()
  @IsOptional()
  shippingAddressLine2?: string;

  @ApiProperty({ example: "Lahore", description: "Shipping city" })
  @IsString()
  @IsOptional()
  shippingCity?: string;

  @ApiPropertyOptional({
    example: "Punjab",
    description: "Shipping state",
  })
  @IsOptional()
  @IsOptional()
  shippingState?: string;

  @ApiProperty({ example: "Pakistan", description: "Shipping country" })
  @IsString()
  @IsOptional()
  shippingCountry?: string;

  @ApiProperty({ example: "54000", description: "Postal code" })
  @IsString()
  @IsOptional()
  shippingPostalCode?: string;

  @ApiProperty({
    description: "New status for the order",
    enum: EOrderStatus,
    example: EOrderStatus.IN_REVIEW,
  })
  @IsEnum(EOrderStatus, { message: "Status must be a valid order status" })
  @IsOptional()
  status?: EOrderStatus;
}
