import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class GetSettingsDto {
    @ApiPropertyOptional({ description: "Key of the settings you want to fetch", example: 'shipping-fee' })
    @IsOptional()
    @IsString()
    key?: string;
}