import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsEmail, IsEnum, IsOptional, IsString } from "class-validator";
import { ERole } from "src/common/enums/role.enum";

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

  @ApiPropertyOptional({
    example: "+923001122334",
    description: "Phone Number",
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    example: "user",
    description: "Role of the user",
  })
  @IsOptional()
  @IsEnum(ERole)
  role?: ERole;

  @ApiPropertyOptional({
    example: false,
    description: "User is banned?",
  })
  @IsOptional()
  @IsBoolean()
  isBanned?: boolean;
}
