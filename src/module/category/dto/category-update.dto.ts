import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { CreateCategoryBodyDto } from "./category-create.dto";
import { IsArray, IsBoolean, IsInt, IsOptional, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class UpdateCategoryBodyDto extends PartialType(CreateCategoryBodyDto) {
    @ApiPropertyOptional({
        type: Boolean,
        description: "If true, replace old images with new ones. Otherwise append.",
        default: false,
    })
    @IsBoolean()
    @IsOptional()
    replaceImages?: boolean;
}

export class CategoryPositionDto {
    @ApiProperty()
    @IsInt()
    id: number;

    @ApiProperty()
    @IsInt()
    position: number;
}

export class UpdateCategoryPositionsDto {
    @ApiProperty({
        type: [CategoryPositionDto],
        description: "Array of category positions to update",
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CategoryPositionDto)
    data: CategoryPositionDto[];
}