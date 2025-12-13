import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsOptional, IsString } from "class-validator";

export class ProductImagesBulkUploadDto {
    @ApiPropertyOptional({
        description: "Optional titles matching the uploaded images order. If omitted, file names are used.",
        type: [String],
        example: ["Product A", "Product B"],
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    titles?: string[];
}
