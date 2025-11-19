import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsString, Min } from "class-validator";
import { Type } from "class-transformer";

export class SignatureQueryDto {
  @ApiProperty({ description: "Signed Token", example: "abc123" })
  @IsString()
  sig: string;
}
