import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class GetStatsDto {
    @ApiProperty({ description: "Date range / period to fetch stats for", example: '7d | 1mo | 6mo | custom_date_range' })
    @IsString()
    period: string;
}