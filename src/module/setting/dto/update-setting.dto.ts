import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, IsEnum } from "class-validator";
import { ESettingType } from "src/common/enums/setting-type.enum";

export class UpdateSettingsDto {
    @ApiPropertyOptional({ description: "Title of the setting" })
    @IsOptional()
    @IsString()
    title?: string;

    @ApiPropertyOptional({ description: "Unique key for the setting" })
    @IsOptional()
    @IsString()
    key: string;

    @ApiPropertyOptional({ description: "Value of the setting" })
    @IsOptional()
    @IsString()
    value: string;

    @ApiPropertyOptional({ description: "Type of the setting", enum: ESettingType })
    @IsOptional()
    @IsEnum(ESettingType)
    type: ESettingType;
}