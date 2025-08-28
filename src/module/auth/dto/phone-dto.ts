import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, Matches } from "class-validator";

export class PhoneDto {
  @ApiProperty({
    description: "User phone number in E.164 format",
    example: "+923001234567",
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\+[1-9]\d{1,14}$/, {
    message: "Phone number must be in valid E.164 format (e.g. +923001234567)",
  })
  phone: string;
}
