import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class GetProductParamDto {
    @ApiProperty({
        description: 'The unique ID of the product',
        example: 1,
        type: Number,
    })
    @IsInt()
    @Min(1)
    id: number;
}
