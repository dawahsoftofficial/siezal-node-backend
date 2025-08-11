import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString, MinLength } from "class-validator";

export class UpdateUserDto {
  @ApiPropertyOptional({ example: "John", description: "First name" })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ example: "Doe", description: "Last name" })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({
    example: "john@example.com",
    description: "Email address",
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  //   @ApiPropertyOptional({
  //     example: "+923001234567",
  //     description: "Phone number",
  //   })
  //   @IsOptional()
  //   @IsString()
  //   phone?: string;

  // @ApiPropertyOptional({ example: '123456', description: 'New password' })
  // @IsOptional()
  // @MinLength(6)
  // password?: string;
}
