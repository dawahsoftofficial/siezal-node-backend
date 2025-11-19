import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from "class-validator";
import { ECategoryStatus } from "src/common/enums/category-status.enum";

export class CategoryBulkCreateItemDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  slug: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  icon?: string | null;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiProperty()
  @IsBoolean()
  slideShow: boolean;

  @ApiProperty()
  @IsBoolean()
  isFeatured: boolean;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  position: number;

  @ApiProperty({ enum: ECategoryStatus, required: false })
  @IsOptional()
  @IsEnum(ECategoryStatus)
  status?: ECategoryStatus;

  @ApiProperty({ required: false, description: "Slug of the parent category" })
  @IsOptional()
  @IsString()
  parentSlug?: string;
}

export class CategoryBulkCreateDto {
  @ApiProperty({ type: [CategoryBulkCreateItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CategoryBulkCreateItemDto)
  categories: CategoryBulkCreateItemDto[];
}
