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
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isAvailable?: boolean;
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

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  allItemCodes?: string[];

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  finalChunk?: boolean;
}

export class ProductCsvImportFinalizeDto {
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

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  allItemCodes: string[];
}
