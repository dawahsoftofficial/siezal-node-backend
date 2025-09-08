import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ELeadStatus, ELeadType } from "../../../common/enums/lead.enum";
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";

export class CreateLeadRequestDto {
  @ApiProperty({
    description: "Request Type *",
    example: "deletion",
    enum: ELeadType,
  })
  @IsEnum(ELeadType)
  type: ELeadType;

  @ApiProperty({
    description: "First name of the account holder requesting deletion",
    example: "John",
    maxLength: 100,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  firstName: string;

  @ApiProperty({
    description: "Last name of the account holder requesting deletion",
    example: "Doe",
    maxLength: 100,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  lastName: string;

  @ApiPropertyOptional({
    description: "Email address of the account holder",
    example: "john@example.com",
    maxLength: 255,
  })
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @ApiPropertyOptional({
    description: "Phone number of the account holder",
    example: "+92-300-1234567",
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone: string;

  @ApiPropertyOptional({
    description: "Purpose or reason for requesting account deletion",
    example: "No longer using the service",
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  purpose?: string;

  @ApiPropertyOptional({
    description: "Additional comments provided by the user",
    example: "Please ensure my data is removed permanently.",
  })
  @IsOptional()
  @IsString()
  comments?: string;

  @ApiPropertyOptional({
    description: "Request status (set automatically by the system)",
    example: "pending",
    enum: ELeadStatus,
    default: ELeadStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(ELeadStatus)
  status?: ELeadStatus;
}
