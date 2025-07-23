/**
 * Decorator for generating standardized Swagger response documentation for a route or controller.
 * Maps HTTP status codes to default descriptions and response DTOs, but allows overrides.
 * Usage: @SwaggerResponse([{ status: HttpStatus.OK, type: MyDto }])
 */
import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import {
  ErrorResponseDto,
  SuccessResponseArrayDto,
  ValidationErrorResponseDto,
  SuccessResponseSingleObjectDto
} from '../dto/app.dto';

/**
 * Applies one or more ApiResponse decorators based on the provided response options.
 * @param responses Array of response options (status, description, type)
 */
export function SwaggerResponse(
  responses: Array<{
    status: HttpStatus; // 👈 Enforce usage of HttpStatus enum
    description?: string;
    type?: any;
  }>,
) {
  const decorators = responses.map((res) =>
    ApiResponse({
      status: res.status,
      description: res.description || getDefaultDescription(res.status),
      type: res.type || getDefaultResponseType(res.status),
    }),
  );

  return applyDecorators(...decorators);
}

/**
 * Returns a default description for a given HTTP status code.
 * @param status HTTP status code
 */
function getDefaultDescription(status: HttpStatus): string {
  switch (status) {
    case HttpStatus.OK:
      return 'Success';
    case HttpStatus.CREATED:
      return 'Created';
    case HttpStatus.BAD_REQUEST:
      return 'Bad Request';
    case HttpStatus.UNAUTHORIZED:
      return 'Unauthorized';
    case HttpStatus.UNPROCESSABLE_ENTITY:
      return 'Validation Error';
    case HttpStatus.INTERNAL_SERVER_ERROR:
      return 'Internal Server Error';
    default:
      return 'Unknown Status';
  }
}

/**
 * Returns a default response DTO for a given HTTP status code.
 * @param status HTTP status code
 */
function getDefaultResponseType(status: HttpStatus): any {
  switch (status) {
    case HttpStatus.OK:
      return SuccessResponseArrayDto;
    case HttpStatus.CREATED:
      return SuccessResponseSingleObjectDto;
    case HttpStatus.BAD_REQUEST:
    case HttpStatus.UNAUTHORIZED:
    case HttpStatus.INTERNAL_SERVER_ERROR:
      return ErrorResponseDto;
    case HttpStatus.UNPROCESSABLE_ENTITY:
      return ValidationErrorResponseDto;
    default:
      return null;
  }
}
