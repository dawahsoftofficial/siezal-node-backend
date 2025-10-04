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

  @ApiPropertyOptional({ example: "address line 1", description: "Shipping Address Line 1" })
  @IsOptional()
  @IsString()
  shippingAddressLine1?: string;

  @ApiPropertyOptional({ example: "address line 2", description: "Shipping Address Line 2" })
  @IsOptional()
  @IsString()
  shippingAddressLine2?: string | null;

  @ApiPropertyOptional({ example: "12345", description: "Shipping Postal Code" })
  @IsOptional()
  @IsString()
  shippingPostalCode?: string;

  @ApiPropertyOptional({ example: "City", description: "Shipping City" })
  @IsOptional()
  @IsString()
  shippingCity?: string;

  @ApiPropertyOptional({ example: "Country", description: "Shipping Country" })
  @IsOptional()
  @IsString()
  shippingCountry?: string;

  @ApiPropertyOptional({ example: "State", description: "Shipping State" })
  @IsOptional()
  @IsString()
  shippingState?: string;

  @ApiPropertyOptional({ example: null, description: "Deletion timestamp" })
  @IsOptional()
  @IsString()
  deletedAt?: Date | null;
}
