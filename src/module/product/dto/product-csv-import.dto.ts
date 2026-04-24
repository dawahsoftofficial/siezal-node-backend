import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from "class-validator";

export class ProductCsvImportRowDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  itemCode: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  regularPrice: number;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  salePrice?: number;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  gstPercentage?: number;
}

export class ProductCsvImportChunkDto {
  @ApiProperty({ type: [ProductCsvImportRowDto] })
  @IsArray()
  @ArrayMaxSize(500)
  @ValidateNested({ each: true })
  @Type(() => ProductCsvImportRowDto)
  rows: ProductCsvImportRowDto[];

  @ApiPropertyOptional({ type: [Number] })
  @IsArray()
  @Type(() => Number)
  @IsInt({ each: true })
  @IsOptional()
  branchIds?: number[];

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  applyToAllBranches?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  includeUnassigned?: boolean;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  defaultCategoryId?: number;
}
