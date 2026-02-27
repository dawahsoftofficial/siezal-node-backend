import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
} from "class-validator";
import { EInventoryStatus } from "src/common/enums/inventory-status.enum";
import { EProductUnit } from "src/common/enums/product-unit.enum";

export class CreateVendorProductDto {
  @ApiProperty({ example: "SKU-001", description: "Vendor SKU identifier" })
  @IsString()
  @IsNotEmpty()
  sku: string;

  @ApiProperty({ example: "Imported Product", description: "Product title" })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: "imported-product", description: "Optional product slug" })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty({ example: "groceries", description: "Category slug resolved server-side" })
  @IsString()
  @IsNotEmpty()
  categorySlug: string;

  @ApiPropertyOptional({ example: "Short description" })
  @IsOptional()
  @IsString()
  shortDescription?: string;

  @ApiPropertyOptional({ example: "Long description" })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: "SEO title" })
  @IsOptional()
  @IsString()
  seoTitle?: string;

  @ApiPropertyOptional({ example: "SEO description" })
  @IsOptional()
  @IsString()
  seoDescription?: string;

  @ApiProperty({ example: 100, description: "Regular price" })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ example: 90, nullable: true })
  @Transform(({ value }) =>
    value === null || value === undefined || value === "" ? null : Number(value)
  )
  @IsOptional()
  @IsNumber()
  @Min(0)
  salePrice?: number | null;

  @ApiProperty({ example: 12, description: "Available stock quantity" })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stockQuantity: number;

  @ApiProperty({ enum: EInventoryStatus, example: EInventoryStatus.AVAILABLE })
  @IsEnum(EInventoryStatus)
  status: EInventoryStatus;

  @ApiPropertyOptional({ example: 2, nullable: true, description: "Optional branch ID" })
  @Transform(({ value }) =>
    value === null || value === undefined || value === "" ? null : Number(value)
  )
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsInt()
  branchId?: number | null;

  @ApiPropertyOptional({ example: 1, description: "Inventory ID, defaults to 1" })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  inventoryId?: number;

  @ApiProperty({ enum: EProductUnit, example: EProductUnit.PIECE })
  @IsEnum(EProductUnit)
  unit: EProductUnit;

  @ApiProperty({ example: true, description: "Whether GST is enabled" })
  @IsBoolean()
  isGstEnabled: boolean;

  @ApiPropertyOptional({ example: 18, nullable: true })
  @ValidateIf((o) => o.isGstEnabled === true)
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  gstFee?: number;

  @ApiPropertyOptional({ example: "https://example.com/image.jpg", description: "Image URL" })
  @IsOptional()
  @IsString()
  image?: string;
}
