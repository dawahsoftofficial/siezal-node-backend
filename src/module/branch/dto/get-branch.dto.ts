import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsOptional } from "class-validator";

export class GetBranchParamDto {
  @ApiProperty({ example: 1, description: "ID of the branch you want to fetch" })
  @IsOptional()
  @IsInt()
  id: number;
}
