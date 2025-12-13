import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from "class-validator";
import { EOrderReplacementStatus } from "src/common/enums/replacement-status.enum";
import { IProduct } from "src/module/product/interface/product.interface";
import { EGatewayType } from "../interface/order.interface";

export class CreateOrderItemDto {
  @ApiProperty({ example: 1, description: "Product ID" })
  @IsInt()
  @Min(1)
  productId: number;

  @ApiProperty({ example: 2, description: "Quantity" })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({
    example: {
      name: "Gaming Mouse",
      sku: ["GM-001"],
      price: 500,
      discountedPrice: 450,
      gstFee: 18,
      category: "gaming-accessories",
      image: "https://image-url.com/sample_image.png",
    },
    description: "Snapshot of product data at time of purchase",
  })
  @IsNotEmpty()
  productData: {
    name: string;
    sku: string[];
    price: number;
    discountedPrice?: number;
    gstFee?: number;
    category?: string;
    image?: string;
  };

  @ApiProperty({ example: 900, description: "Total price for this item" })
  @IsNumber()
  totalPrice: number;

  @ApiPropertyOptional({
    example: 900,
    description: "Total Gst Amount for that item if gst enabled for this item",
  })
  @IsOptional()
  @IsNumber()
  totalGstAmount?: number;

  @ApiPropertyOptional({
    enum: EOrderReplacementStatus,
    description: "Replacement status of this order item",
    nullable: true,
  })
  @IsOptional()
  @IsEnum(EOrderReplacementStatus)
  replacementStatus?: EOrderReplacementStatus | null;

  @ApiPropertyOptional({
    type: () => [Object],
    description: "List of suggested replacement products",
    nullable: true,
  })
  @IsOptional()
  suggestedProducts?: IProduct[] | null;

  @ApiPropertyOptional({
    description: "Timestamp of the replacement",
  })
  @IsOptional()
  @IsNumber()
  timestamp?: number | null;
}

export class UpdateOrderItemDto extends PartialType(CreateOrderItemDto) {}
