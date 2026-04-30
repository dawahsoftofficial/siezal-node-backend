import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsEmail, IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { ERole } from "src/common/enums/role.enum";

export class CreateStaffDto {
  @ApiProperty({ example: "John", description: "First name" })
  @IsString()
  firstName: string;

  @ApiProperty({ example: "Doe", description: "Last name" })
  @IsString()
  lastName: string;

  @ApiProperty({
    example: "john@example.com",
    description: "Email address",
  })
  @IsEmail()
  email: string;

  @ApiProperty({ example: "password123", description: "Password" })
  @IsString()
  password: string;

  @ApiProperty({
    example: "+923001122334",
    description: "Phone Number",
  })
  @IsString()
  phone: string;

  @ApiProperty({
    example: "user",
    description: "Role of the staff",
  })
  @IsEnum(ERole)
  role: ERole;

  @ApiPropertyOptional({
    example: 1,
    description: "Assigned branch ID",
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  branchId?: number | null;

  @ApiPropertyOptional({
    example: false,
    description: "Staff is banned?",
  })
  @IsOptional()
  @IsBoolean()
  isBanned: boolean;

  @ApiPropertyOptional({ example: null, description: "Deletion timestamp" })
  @IsOptional()
  @IsString()
  deletedAt?: Date | null;
}

export class UpdateStaffDto extends PartialType(CreateStaffDto) { }
