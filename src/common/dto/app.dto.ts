/**
 * Common response DTOs for API success, error, and validation responses.
 * These classes are used for Swagger documentation and consistent API structure.
 */
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsString,
  IsObject,
  IsArray,
  IsDateString,
  ValidateNested,
} from 'class-validator';

/**
 * Success response for a single object.
 */
export class SuccessResponseSingleObjectDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  success: boolean;

  @ApiProperty({ example: 'Request successful' })
  @IsString()
  message: string;

  @ApiProperty({ example: { key: 'value' } })
  @IsObject()
  data: Record<string, any>;

  @ApiProperty({ example: '11/03/2025 12:54:06 PM' })
  @IsDateString()
  timestamp: string;
}

/**
 * Success response for a single object with access and refresh tokens.
 */
export class SuccessResponseSingleObjectWithTokenDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  success: boolean;

  @ApiProperty({ example: 'Request successful' })
  @IsString()
  message: string;

  @ApiProperty({ example: { key: 'value' } })
  @IsObject()
  data: Record<string, any>;

  @ApiProperty({ example: '11/03/2025 12:54:06 PM' })
  @IsDateString()
  timestamp: string;

  @ApiProperty({ example: 'access-token' })
  @IsString()
  accessToken: string;

  @ApiProperty({ example: 'refresh-token' })
  @IsString()
  refreshToken: string;

  // TODO: Define and import KeyDto if needed in the future
  // @ApiProperty({ type: KeyDto })
  // @IsObject()
  // @Type(() => KeyDto)
  // extra: KeyDto;
}

/**
 * Success response for an array of objects.
 */
export class SuccessResponseArrayDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  success: boolean;

  @ApiProperty({ example: 'Request successful' })
  @IsString()
  message: string;

  @ApiProperty({ type: [Object], example: [{ key: 'value' }] })
  @IsArray()
  data: Record<string, any>[];

  @ApiProperty({ example: '11/03/2025 12:54:06 PM' })
  @IsDateString()
  timestamp: string;
}

/**
 * Success response with no data payload.
 */
export class SuccessResponseNoDataDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  success: boolean;

  @ApiProperty({ example: 'Request successful' })
  @IsString()
  message: string;

  @ApiProperty({ example: '11/03/2025 12:54:06 PM' })
  @IsDateString()
  timestamp: string;
}

/**
 * Error response for failed API requests.
 */
export class ErrorResponseDto {
  @ApiProperty({ example: false })
  @IsBoolean()
  success: boolean;

  @ApiProperty({ example: 'Something went wrong' })
  @IsString()
  message: string;

  @ApiProperty({ example: 'Detailed error message' })
  @IsString()
  errors: string;

  @ApiProperty({ example: '11/03/2025 12:54:06 PM' })
  @IsDateString()
  timestamp: string;
}

/**
 * Error response for validation errors.
 */
export class ValidationErrorResponseDto {
  @ApiProperty({ example: false })
  @IsBoolean()
  success: boolean;

  @ApiProperty({ example: 'Validation error occurred' })
  @IsString()
  message: string;

  @ApiProperty({ example: 'Invalid input data' })
  @IsString()
  data: string;

  @ApiProperty({ example: { title: ['title should not be empty'] } })
  @IsObject()
  errors: Record<string, string[]>;

  @ApiProperty({ example: '11/03/2025 12:54:06 PM' })
  @IsDateString()
  timestamp: string;
}

/**
 * Success response for authentication/token endpoints.
 */
export class SuccessResponseTokenDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  success: boolean;

  @ApiProperty({ example: 'Request successful' })
  @IsString()
  message: string;

  @ApiProperty({ example: '20/02/2025 05:26:47 PM' })
  @IsDateString()
  timestamp: string;

  @ApiProperty({ example: 'access-token' })
  @IsString()
  accessToken: string;

  @ApiProperty({ example: 'refresh-token' })
  @IsString()
  refreshToken: string;
}
