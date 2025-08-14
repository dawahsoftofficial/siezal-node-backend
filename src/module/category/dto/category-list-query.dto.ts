import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsString } from "class-validator";
import { PaginationDto } from "src/common/dto/pagination.dto";

export class CategoryListQueryDto extends PaginationDto {
  @IsOptional()
  @Type(() => String)
  @IsString()
  parentSlug?: string;
}
