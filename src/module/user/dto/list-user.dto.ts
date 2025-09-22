import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ToBoolean } from 'src/common/utils/app.util';

export class GetCustomersQueryDto extends PaginationDto {
    @ApiPropertyOptional({
        description: 'Search term to match in name, email, or phone',
        example: 'john',
    })
    @IsOptional()
    @IsString()
    query?: string;

    @ApiPropertyOptional({
        description: 'Show the trash list or normal index list',
        example: true,
    })
    @IsOptional()
    @ToBoolean()
    @IsBoolean()
    trash?: boolean
}
