import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MinLength,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";

export class SignupDto {
  @ApiProperty({
    example: "John",
    description: "First name of the user",
  })
  @IsNotEmpty({ message: "First name is required" })
  @IsString()
  firstName: string;

  @ApiPropertyOptional({
    example: "Doe",
    description: "Last name of the user (optional)",
    required: false,
  })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({
    example: "user@example.com",
    description: "Valid email address of the user",
  })
  @IsOptional({ message: "Email is required" })
  @IsEmail({}, { message: "Must be a valid email address" })
  @Transform(({ value }) => (value === "" ? null : value))
  email?: string | null;

  @ApiProperty({
    example: "StrongPassword123!",
    description: "User password (minimum 5 characters)",
  })
  @IsNotEmpty({ message: "Password is required" })
  @MinLength(5, { message: "Password must be at least 5 characters long" })
  password: string;

  @ApiProperty({
    example: "+923001234567",
    description: "Phone number in international format",
  })
  @IsNotEmpty({ message: "Phone number is required" })
  @IsPhoneNumber("PK", { message: "Must be a valid Pakistani phone number" })
  phone: string;
}
