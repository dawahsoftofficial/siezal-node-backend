import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsOptional, Min } from "class-validator";

export class SyncBranchProductsChunkDto {
  @ApiProperty({ example: 1, description: "Source branch ID" })
  @Type(() => Number)
  @IsInt()
  sourceBranchId: number;

  @ApiProperty({ example: 2, description: "Target branch ID" })
  @Type(() => Number)
  @IsInt()
  targetBranchId: number;

  @ApiProperty({ example: 0, description: "Offset for pagination" })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset: number;

  @ApiPropertyOptional({ example: 500, description: "Limit for pagination" })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}

export class SyncPrimaryProductsChunkDto {
  @ApiProperty({ example: 1, description: "Target branch ID" })
  @Type(() => Number)
  @IsInt()
  targetBranchId: number;

  @ApiProperty({ example: 0, description: "Offset for pagination" })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset: number;

  @ApiPropertyOptional({ example: 500, description: "Limit for pagination" })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}
