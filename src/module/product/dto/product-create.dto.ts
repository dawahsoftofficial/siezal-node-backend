import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  IsEnum,
  IsBoolean,
  ValidateIf,
  IsDefined,
} from "class-validator";
import { EInventoryStatus } from "src/common/enums/inventory-status.enum";
import { EProductUnit } from "src/common/enums/product-unit.enum";
import { ToBoolean } from "src/common/utils/app.util";

export class CreateProductBodyDto {
  @ApiProperty({ example: ["SKU-001"], description: "Stock Keeping Units", type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  sku?: string[];

  @ApiProperty({ example: "Gaming Laptop", description: "Product title" })
  @IsString()
  title: string;

  @ApiProperty({ example: "gaming-laptop", description: "Product slug" })
  @IsString()
  slug: string;

  @ApiProperty({
    example: "High-performance gaming laptop",
    description: "Short description of the product",
  })
  @IsString()
  @IsOptional()
  shortDescription?: string;

  @ApiProperty({
    example: "A detailed description of the product",
    description: "Full product description",
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: "Best Gaming Laptop 2025",
    description: "SEO title for the product",
  })
  @IsString()
  @IsOptional()
  seoTitle?: string;

  @ApiProperty({
    example: "This gaming laptop offers unmatched performance...",
    description: "SEO description for the product",
  })
  @IsString()
  @IsOptional()
  seoDescription?: string;

  @ApiProperty({ example: 1500.99, description: "Product price" })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({
    example: 1299.99,
    description: "Sale price of the product",
    nullable: true,
  })
  @Transform(({ value }) =>
    value === null || value === undefined || value === "" ? null : Number(value)
  )
  @IsNumber()
  @IsOptional()
  salePrice?: number | null;

  @ApiProperty({ example: 25, description: "Available stock quantity" })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stockQuantity: number;

  @ApiProperty({
    enum: EInventoryStatus,
    example: EInventoryStatus.AVAILABLE,
    description: "Inventory status",
  })
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

  // @ApiProperty({ description: "Image URL" })
  // @IsOptional()
  // image?: string;

  @ApiProperty({
    enum: EProductUnit,
    example: EProductUnit.PIECE,
    description: "Unit of measurement for the product",
  })
  @IsEnum(EProductUnit)
  unit: EProductUnit;

  @ApiProperty({ example: true, description: "Whether GST is applicable" })
  @ToBoolean()
  @IsBoolean()
  isGstEnabled: boolean;

  @ApiProperty({
    example: 18,
    description: "Gst Fee Percentage of the product (required if GST enabled)",
  })
  @ValidateIf((o) => o.isGstEnabled === true) // only validate if GST is enabled
  @IsDefined({ message: "gstFee is required when GST is enabled" })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  gstFee?: number;

  // @FileField("image", { required: true })
  // image: Express.Multer.File;

  // @ApiProperty({ example: ["https://example.com/img1.jpg", "https://example.com/img2.jpg"], description: "Gallery image URLs" })
  // @IsArray()
  // @IsString({ each: true })
  // @IsOptional()
  // gallery?: string[];
}
