import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { PaginationDto } from "src/common/dto/pagination.dto";

export class VendorProductListDto extends PaginationDto {
  @ApiPropertyOptional({
    description: "Search by product title, SKU, category name, or category slug",
    example: "SZ-001",
  })
  @IsOptional()
  @IsString()
  q?: string;
}
