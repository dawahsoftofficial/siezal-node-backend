import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetOrderParamDto {
    @ApiProperty({ description: 'Order ID', example: 1 })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    id: number;
}

export class GetOrderItemParamDto {
    @ApiProperty({ description: 'Order Item ID', example: 1 })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    id: number;
}
