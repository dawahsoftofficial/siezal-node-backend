import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  ArrayUnique,
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  ArrayMinSize,
  Matches,
  ValidateIf,
  ValidateNested,
} from "class-validator";
import { BRANCH_TIME_PATTERN } from "../branch.constants";

class BranchDayScheduleDto {
  @ApiProperty({
    example: true,
    description: "Whether the branch is open on that day",
  })
  @IsBoolean()
  isOpen: boolean;

  @ApiPropertyOptional({
    example: "09:00",
    description: "Opening time in HH:mm format",
  })
  @ValidateIf(({ isOpen }) => isOpen)
  @IsNotEmpty()
  @IsString()
  @Matches(BRANCH_TIME_PATTERN, {
    message: "startTime must be in HH:mm format",
  })
  startTime?: string | null;

  @ApiPropertyOptional({
    example: "18:00",
    description: "Closing time in HH:mm format",
  })
  @ValidateIf(({ isOpen }) => isOpen)
  @IsNotEmpty()
  @IsString()
  @Matches(BRANCH_TIME_PATTERN, {
    message: "endTime must be in HH:mm format",
  })
  endTime?: string | null;
}

class BranchWeeklyScheduleDto {
  @ApiProperty({ type: BranchDayScheduleDto })
  @ValidateNested()
  @Type(() => BranchDayScheduleDto)
  sun: BranchDayScheduleDto;

  @ApiProperty({ type: BranchDayScheduleDto })
  @ValidateNested()
  @Type(() => BranchDayScheduleDto)
  mon: BranchDayScheduleDto;

  @ApiProperty({ type: BranchDayScheduleDto })
  @ValidateNested()
  @Type(() => BranchDayScheduleDto)
  tue: BranchDayScheduleDto;

  @ApiProperty({ type: BranchDayScheduleDto })
  @ValidateNested()
  @Type(() => BranchDayScheduleDto)
  wed: BranchDayScheduleDto;

  @ApiProperty({ type: BranchDayScheduleDto })
  @ValidateNested()
  @Type(() => BranchDayScheduleDto)
  thu: BranchDayScheduleDto;

  @ApiProperty({ type: BranchDayScheduleDto })
  @ValidateNested()
  @Type(() => BranchDayScheduleDto)
  fri: BranchDayScheduleDto;

  @ApiProperty({ type: BranchDayScheduleDto })
  @ValidateNested()
  @Type(() => BranchDayScheduleDto)
  sat: BranchDayScheduleDto;
}

class BranchServiceAreaPointDto {
  @ApiProperty({
    example: 31.4725,
    description: "Polygon latitude coordinate",
  })
  @Type(() => Number)
  @IsNumber()
  lat: number;

  @ApiProperty({
    example: 74.4107,
    description: "Polygon longitude coordinate",
  })
  @Type(() => Number)
  @IsNumber()
  lng: number;
}

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

  @ApiPropertyOptional({
    type: BranchWeeklyScheduleDto,
    description: "Opening schedule for each day of the week",
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => BranchWeeklyScheduleDto)
  weeklySchedule?: BranchWeeklyScheduleDto | null;

  @ApiPropertyOptional({
    type: [String],
    example: ["DHA", "Gulberg", "Johar Town"],
    description: "Delivery areas supported by this branch",
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  @MaxLength(100, { each: true })
  deliveryAreas?: string[];

  @ApiPropertyOptional({
    type: [BranchServiceAreaPointDto],
    description: "Service area polygon points for the branch",
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(3)
  @ValidateNested({ each: true })
  @Type(() => BranchServiceAreaPointDto)
  serviceArea?: BranchServiceAreaPointDto[] | null;

  @ApiPropertyOptional({ example: null, description: "Deletion timestamp" })
  @IsOptional()
  deletedAt?: Date | null;
}

export class UpdateBranchDto extends PartialType(CreateBranchDto) {}
