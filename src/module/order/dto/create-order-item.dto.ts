import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateOrderItemDto {
    @ApiProperty({ example: 1, description: 'Product ID' })
    @IsInt()
    @Min(1)
    productId: number;

    @ApiProperty({ example: 2, description: 'Quantity' })
    @IsInt()
    @Min(1)
    quantity: number;

    @ApiProperty({
        example: { name: 'Gaming Mouse', sku: 'GM-001', price: 500, discountedPrice: 450 },
        description: 'Snapshot of product data at time of purchase'
    })
    @IsNotEmpty()
    productData: {
        name: string;
        sku: string;
        price: number;
        discountedPrice?: number;
    };

    @ApiProperty({ example: 900, description: 'Total price for this item' })
    @IsNumber()
    totalPrice: number;
}
