import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsOptional, IsString } from "class-validator";
import { PaginationDto } from "src/common/dto/pagination.dto";

export class CategoryListQueryDto extends PaginationDto { }

export class CategoryListQueryDtoAdmin extends CategoryListQueryDto {
    @ApiPropertyOptional({
        description: 'Search term to match in name or slug',
        example: 'fruits',
    })
    @IsOptional()
    @IsString()
    q?: string;

    @ApiPropertyOptional({
        description: 'Column to sort by (default: time)',
        example: 'time | name | featured',
    })
    @IsOptional()
    @IsIn(['time', 'name', 'featured'])
    sortBy?: 'time' | 'name' | 'featured';

    @ApiPropertyOptional({
        description: 'Sort direction (default: DESC)',
        example: 'ASC | DESC',
    })
    @IsOptional()
    @IsIn(['ASC', 'DESC'])
    sortDirection?: 'ASC' | 'DESC';
}
