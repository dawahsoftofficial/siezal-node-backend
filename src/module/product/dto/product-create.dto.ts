import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  IsEnum,
  IsArray,
  ArrayNotEmpty,
  IsUrl
} from "class-validator";
import { EInventoryStatus } from "src/common/enums/inventory-status.enum"; 

export class CreateProductBodyDto {
  @ApiProperty({ example: "SKU-001", description: "Stock Keeping Unit" })
  @IsString()
  @IsOptional()
  sku?: string;

  @ApiProperty({ example: "Gaming Laptop", description: "Product title" })
  @IsString()
  title: string;

  @ApiProperty({ example: "gaming-laptop", description: "Product slug" })
  @IsString()
  slug: string;

  @ApiProperty({ example: "High-performance gaming laptop", description: "Short description of the product" })
  @IsString()
  @IsOptional()
  shortDescription?: string;

  @ApiProperty({ example: "A detailed description of the product", description: "Full product description" })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: "Best Gaming Laptop 2025", description: "SEO title for the product" })
  @IsString()
  @IsOptional()
  seoTitle?: string;

  @ApiProperty({ example: "This gaming laptop offers unmatched performance...", description: "SEO description for the product" })
  @IsString()
  @IsOptional()
  seoDescription?: string;

  @ApiProperty({ example: 1500.99, description: "Product price" })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 1299.99, description: "Sale price of the product" })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  salePrice?: number;

  @ApiProperty({ example: 25, description: "Available stock quantity" })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stockQuantity: number;

  @ApiProperty({ enum: EInventoryStatus, example: EInventoryStatus.AVAILABLE, description: "Inventory status" })
  @IsEnum(EInventoryStatus)
  status: EInventoryStatus;

  @ApiProperty({ example: 1, description: "Category ID" })
  @Type(() => Number)
  @IsInt()
  categoryId: number;

  @ApiProperty({ example: 1, description: "Inventory ID" })
  @Type(() => Number)
  @IsInt()
  inventoryId: number;

  @ApiProperty({ example: "https://example.com/image.jpg", description: "Main product image URL" })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiProperty({ example: ["https://example.com/img1.jpg", "https://example.com/img2.jpg"], description: "Gallery image URLs" })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  gallery?: string[];
}
