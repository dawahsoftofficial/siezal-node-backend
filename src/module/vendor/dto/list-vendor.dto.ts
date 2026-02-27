import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { PaginationDto } from "src/common/dto/pagination.dto";

export class ListVendorDto extends PaginationDto {
  @ApiPropertyOptional({ example: "retail", description: "Search by name, code, or contact email" })
  @IsOptional()
  @IsString()
  query?: string;
}
