/**
 * Global exception filter that catches all unhandled exceptions in the application.
 * Formats error responses and logs details for debugging and monitoring.
 * Register this filter in main.ts or as a global provider.
 */
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { currentDateTime } from '../utils/date.util';

/**
 * Handles all exceptions and formats the error response for the client.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);
  private readonly configService: ConfigService;

  constructor(configService: ConfigService) {
    this.configService = configService;
  }

  /**
   * Main catch method for handling exceptions.
   * @param exception The thrown exception (can be any type)
   * @param host ArgumentsHost for accessing request/response context
   */
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    // Determine HTTP status code
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: any = 'Something went wrong.';
    let errors: any[] = [];
    let stackTrace: string | undefined;

    // Handle different exception types and extract message/errors
    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (status == 422) {
        message = exceptionResponse['message'] || message;
        errors = exceptionResponse['errors'] || [];
      } else if (typeof exceptionResponse === 'object') {
        message = exceptionResponse['message'] || message;

        // If validation errors are present (from class-validator)
        if (Array.isArray(message)) {
          errors = message.map((error) => ({
            field: this.extractFieldFromMessage(error),
            error,
          }));
          message = errors[0].error;
          // message = 'Validation failed for the input data.';
        }
      }

      stackTrace = exception.stack;
    } else if (
      exception instanceof Error &&
      this.configService.get<string>('NODE_ENV') == 'local'
    ) {
      message = exception.message || message;
      stackTrace = exception.stack;
    }

    // Log the error with stack trace and additional details
    this.logger.error(
      `Error occurred on ${request.method} ${request.url}`,
      stackTrace || 'No stack trace available',
    );
    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      errors: status == 422 ? errors : errors.length > 0 ? errors : undefined,
      timestamp: currentDateTime(),
    });
  }

  /**
   * Helper method to extract the field name from validation error messages.
   * Example: Converts "phone must be a valid number" to "phone".
   */
  private extractFieldFromMessage(message: string): string {
    const match = message.match(/^(\w+)\s/);
    return match ? match[1] : 'unknown';
  }
}
