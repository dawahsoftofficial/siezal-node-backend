import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsIn, IsInt, IsOptional, IsPositive, IsString } from "class-validator";
import { PaginationDto } from "src/common/dto/pagination.dto";
import { ToBoolean } from "src/common/utils/app.util";

export class CategoryListQueryDto extends PaginationDto {
    @ApiPropertyOptional({
        description: 'Branch ID to filter visible categories with',
        example: 2,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @IsPositive()
    branchId?: number;

    @ApiPropertyOptional({
        description: 'Show only categories that contain general inventory without a branch assignment',
        example: true,
    })
    @IsOptional()
    @ToBoolean()
    @IsBoolean()
    generalOnly?: boolean;
}

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
