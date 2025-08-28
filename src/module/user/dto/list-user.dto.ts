import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class GetCustomersQueryDto extends PaginationDto {
    @ApiPropertyOptional({
        description: 'Search term to match in name, email, or phone',
        example: 'john',
    })
    @IsOptional()
    @IsString()
    query?: string;
}
