import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { PaginationDto } from "src/common/dto/pagination.dto";

export class VendorLogListDto extends PaginationDto {
  @ApiPropertyOptional({
    description:
      "Filter by log type (e.g. login, branch_list, product_list, product_create, product_update)",
    example: "product_update",
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({
    description: "Search across endpoint, method, IP, or error message",
    example: "products",
  })
  @IsOptional()
  @IsString()
  q?: string;
}
