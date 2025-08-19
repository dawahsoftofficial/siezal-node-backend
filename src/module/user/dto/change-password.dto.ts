import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString } from "class-validator";

export class ChangePasswordDto {
  @ApiProperty({
    example: "XXXXX",
    description: "Current/ Old password",
  })
  @IsString()
  currentPassword: string;

  @ApiProperty({
    example: "XXXXX",
    description: "New password",
  })
  @IsString()
  newPassword: string;
}
