import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsOptional, IsString } from "class-validator";

export class GetStaffParamDto {
  @ApiProperty({ example: 6, description: "ID of the staff you want to fetch" })
  @IsOptional()
  @IsInt()
  id: number;
}
