import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import {
  IsBoolean,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";

export class CreateBranchDto {
  @ApiProperty({ example: "DHA Lahore", description: "Branch name" })
  @IsString()
  @MaxLength(150)
  name: string;

  @ApiProperty({
    example: "32 Y Block, DHA Phase 3, Lahore",
    description: "Branch street address",
  })
  @IsString()
  @MaxLength(255)
  address: string;

  @ApiProperty({
    example: 31.4725,
    description: "Google latitude coordinate for the branch",
  })
  @IsNumber()
  latitude: number;

  @ApiProperty({
    example: 74.4107,
    description: "Google longitude coordinate for the branch",
  })
  @IsNumber()
  longitude: number;

  @ApiProperty({
    example: "+92 300 1234567",
    description: "Primary branch contact number",
  })
  @IsString()
  @MaxLength(50)
  phone: string;

  @ApiPropertyOptional({
    example: "dha@siezal.com",
    description: "Optional branch email",
  })
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string | null;

  @ApiPropertyOptional({
    example: true,
    description: "Whether the branch is currently active",
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: null, description: "Deletion timestamp" })
  @IsOptional()
  deletedAt?: Date | null;
}

export class UpdateBranchDto extends PartialType(CreateBranchDto) {}
