import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsPositive, IsString, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class GetProductsQueryDtoAdmin extends PaginationDto {
    @ApiPropertyOptional({
        description: 'Search term to match in title or description',
        example: 'laptop',
    })
    @IsOptional()
    @IsString()
    q?: string;
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
