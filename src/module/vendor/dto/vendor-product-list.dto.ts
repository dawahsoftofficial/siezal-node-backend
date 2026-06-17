import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsOptional, IsPositive, IsString } from "class-validator";
import { PaginationDto } from "src/common/dto/pagination.dto";

export class VendorProductListDto extends PaginationDto {
  @ApiPropertyOptional({
    description: "Search by product title, SKU, category name, or category slug",
    example: "SZ-001",
  })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({
    description: "Branch ID to filter imported products by",
    example: 3,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  branchId?: number;
}
