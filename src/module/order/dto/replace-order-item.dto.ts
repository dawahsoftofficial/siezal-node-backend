import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsNumber, IsOptional } from "class-validator";
import { EOrderReplacementStatus } from "src/common/enums/replacement-status.enum";

export class ReplaceOrderItemDto {
    @ApiProperty({
        enum: EOrderReplacementStatus,
        description: "Replacement status of this order item",
    })
    @IsEnum(EOrderReplacementStatus)
    replacementStatus: EOrderReplacementStatus;

    @ApiProperty({
        description: "Expiry time of the replacement"
    })
    @IsNumber()
    timestamp: number;

    @ApiPropertyOptional({
        description: "ID of the product suggested for replacement (only required if accepted)",
        nullable: true
    })
    @IsOptional()
    @IsNumber()
    newProductId?: number | null;
}