import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { PaginationDto } from "src/common/dto/pagination.dto";

export class CategoryListQueryDto extends PaginationDto {}

export class CategoryListQueryDtoAdmin extends CategoryListQueryDto {
    @ApiPropertyOptional({
        description: 'Search term to match in name or slug',
        example: 'fruits',
    })
    @IsOptional()
    @IsString()
    q?: string;
}
