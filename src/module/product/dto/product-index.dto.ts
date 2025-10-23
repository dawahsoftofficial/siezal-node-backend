import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsPositive, IsString, IsArray, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ToBoolean } from 'src/common/utils/app.util';

export class GetProductsQueryDtoAdmin extends PaginationDto {
    @ApiPropertyOptional({
        description: 'Search term to match in title or description',
        example: 'laptop',
    })
    @IsOptional()
    @IsString()
    q?: string;

    @ApiPropertyOptional({
        description: 'Category Slug to filter with',
        example: 'dairy',
    })
    @IsOptional()
    @IsString()
    category?: string;

    @ApiPropertyOptional({
        description: 'Max price to filter with',
        example: 1000,
    })
    @IsOptional()
    @IsInt()
    @IsPositive()
    price?: number;

    @ApiPropertyOptional({
        description: 'Show only the newly imported products',
        example: true,
    })
    @IsOptional()
    @ToBoolean()
    @IsBoolean()
    imported?: boolean
}

export class GetProductsQueryDtoUser extends GetProductsQueryDtoAdmin {
    @ApiPropertyOptional({
        description: 'Filter by category ID',
        example: 3,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @IsPositive()
    categoryId?: number;

    @ApiPropertyOptional({
        description: 'Filter by attribute tags (names or IDs)',
        example: ['red', 'large', '12'],
        type: [String],
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];
}
