import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { EOrderStatus } from 'src/common/enums/order-status.enum';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ToBoolean } from 'src/common/utils/app.util';

type OrderStatusFilter = EOrderStatus | 'ongoing' | 'done';

export class GetOrdersQueryDto extends PaginationDto {
    @ApiPropertyOptional({
        enum: [...Object.values(EOrderStatus), 'ongoing', 'done'],
        description: 'Filter by order status',
    })
    @IsOptional()
    @IsIn([...Object.values(EOrderStatus), 'ongoing', 'done'])
    status?: OrderStatusFilter;
}
export class GetOrdersQueryDtoAdmin extends GetOrdersQueryDto {
    @ApiPropertyOptional({ example: 1, description: 'Filter by user id' })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    userId?: number;

    @ApiPropertyOptional({ description: 'Search term to match in customer name, phone number or order id' })
    @IsOptional()
    @IsString()
    q?: string;

    @ApiPropertyOptional({
        description: 'Show the trash list or normal index list',
        example: true,
    })
    @IsOptional()
    @ToBoolean()
    @IsBoolean()
    trash?: boolean
}
