import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { Allow, IsBoolean, IsInt, IsOptional, IsString, Min } from "class-validator";

export class CreateCategoryBodyDto {
  @ApiProperty({ example: "Gaming Laptops", description: "Category name" })
  @IsString()
  name: string;

  @ApiProperty({ example: "gaming-laptops", description: "Unique slug for the category" })
  @IsString()
  slug: string;

  @Allow()
  icon?: any;

  @Allow()
  images?: any[];

  @ApiPropertyOptional({ example: 1, description: "Parent category ID (if nested)" })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  parentId?: number;

  @ApiProperty({ example: true, description: "Whether category should appear in slideshow" })
  @IsBoolean()
  slideShow: boolean;

  @ApiProperty({ example: false, description: "Whether category is featured" })
  @IsBoolean()
  isFeatured: boolean;

  @ApiProperty({ example: 1, description: "Position/order of category" })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  position: number;
}
