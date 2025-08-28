import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsOptional, IsString } from "class-validator";

export class GetUserParamDto {
  @ApiProperty({ example: 6, description: "ID of the user you want to fetch" })
  @IsOptional()
  @IsInt()
  id: number;
}
