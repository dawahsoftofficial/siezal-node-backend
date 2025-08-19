import { ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { CreateCategoryBodyDto } from "./category-create.dto";
import { IsBoolean, IsOptional } from "class-validator";

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