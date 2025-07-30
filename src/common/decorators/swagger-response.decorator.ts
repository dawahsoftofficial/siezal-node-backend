/**
 * Decorator for generating standardized Swagger response documentation for a route or controller.
 * Maps HTTP status codes to default descriptions and response DTOs, but allows overrides.
 * Usage: @SwaggerResponse([{ status: HttpStatus.OK, type: MyDto }])
 */
import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiExtraModels, ApiResponse } from '@nestjs/swagger';
import {
  ErrorResponseDto,
  SuccessResponseArrayDto,
  ValidationErrorResponseDto,
  SuccessResponseSingleObjectDto
} from '../dto/app.dto';
import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

/**
 * Applies one or more ApiResponse decorators based on the provided response options.
 * @param responses Array of response options (status, description, type)
 */
export function SwaggerResponse(
  responses: Array<{
    status: HttpStatus; // 👈 Enforce usage of HttpStatus enum
    description?: string;
    type?: any;
    schema?:SchemaObject & Partial<SchemaObject>;
  }>,
) {
 
  const decorators = responses.map((res) =>
   
ApiResponse({
  status: res.status,
  description: res.description || getDefaultDescription(res.status),
  ...(res.schema ? { schema: res.schema } : { type: res.type || getDefaultResponseType(res.status) })
})
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
    case HttpStatus.NOT_FOUND:
      return 'Not Found';  
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
   case HttpStatus.NOT_FOUND:
      return ErrorResponseDto;   
    default:
      return null;
  }
}
