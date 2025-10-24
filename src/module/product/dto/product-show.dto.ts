import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsInt, IsNumber, Min } from "class-validator";
import { ToBoolean } from "src/common/utils/app.util";

export class GetProductParamDto {
  @ApiProperty({
    description: "The unique ID of the product",
    example: 1,
    type: Number,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1, { message: "Id must be at least 1" })
  id: number;
}

export class HandleImportBatchDto {
    @ApiProperty({
        description: 'Accept or reject an import batch',
        example: true,
    })
    @ToBoolean()
    @IsBoolean()
    accepted: boolean
}
