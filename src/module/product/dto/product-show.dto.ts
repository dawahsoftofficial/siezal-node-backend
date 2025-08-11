import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsNumber, Min } from "class-validator";

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
