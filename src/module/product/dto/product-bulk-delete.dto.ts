import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, Matches } from "class-validator";

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
