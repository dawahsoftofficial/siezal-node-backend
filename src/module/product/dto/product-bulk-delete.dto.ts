import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsOptional, IsPositive, Matches } from "class-validator";
import { Type } from "class-transformer";

export class BulkDeleteProductsDto {
    @ApiProperty({
        description: "Date range to delete products, format DD/MM/YYYY-DD/MM/YYYY",
        example: "01/01/2024-31/01/2024",
    })
    @IsNotEmpty()
    @Matches(/^\d{2}\/\d{2}\/\d{4}-\d{2}\/\d{2}\/\d{4}$/, {
        message: "dateRange must be in the format DD/MM/YYYY-DD/MM/YYYY",
    })
    dateRange: string;
}

export class BulkDeleteByBranchDto {
    @ApiPropertyOptional({
        description: "Branch ID to delete products from. Omit to delete products with no branch.",
        example: 1,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @IsPositive()
    branchId?: number;
}
