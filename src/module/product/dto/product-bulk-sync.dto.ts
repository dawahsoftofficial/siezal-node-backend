import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from "class-validator";
import { EInventoryStatus } from "src/common/enums/inventory-status.enum";
import { EProductUnit } from "src/common/enums/product-unit.enum";

export class ProductBulkSyncItemDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  categorySlug: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sku?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  shortDescription?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  seoTitle?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  seoDescription?: string;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ required: false })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  salePrice?: number;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stockQuantity: number;

  @ApiProperty({ enum: EInventoryStatus })
  @IsEnum(EInventoryStatus)
  status: EInventoryStatus;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  inventoryId: number;

  @ApiProperty({ enum: EProductUnit })
  @IsEnum(EProductUnit)
  unit: EProductUnit;

  @ApiProperty()
  @IsBoolean()
  isGstEnabled: boolean;

  @ApiProperty({ required: false })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  gstFee?: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  image: string;
}

export class ProductBulkSyncDto {
  @ApiProperty({ type: [ProductBulkSyncItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductBulkSyncItemDto)
  products: ProductBulkSyncItemDto[];
}
