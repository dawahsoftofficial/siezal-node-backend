import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { EOrderStatus } from 'src/common/enums/order-status.enum';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class GetOrdersQueryDto extends PaginationDto {
    @ApiPropertyOptional({ enum: EOrderStatus, description: 'Filter by order status' })
    @IsOptional()
    @IsEnum(EOrderStatus)
    status?: EOrderStatus;
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
}
