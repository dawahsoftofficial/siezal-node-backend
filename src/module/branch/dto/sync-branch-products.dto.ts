import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt } from "class-validator";

export class SyncBranchProductsDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  sourceBranchId: number;

  @ApiProperty({ example: 2 })
  @Type(() => Number)
  @IsInt()
  targetBranchId: number;
}
