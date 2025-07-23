/**
 * Decorator for generating comprehensive Swagger documentation for a route or controller.
 * Allows configuration of headers, security, query params, body, params, and responses in a single place.
 * Usage: @GenerateSwaggerDoc({ summary: '...', headers: [...], responses: [...] })
 */
import { applyDecorators } from '@nestjs/common';
import {
  ApiBasicAuth,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCookieAuth,
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiSecurity,
} from '@nestjs/swagger';
import { GenerateSwaggerDocOptions } from '../interfaces/swagger.interface';
import { SwaggerResponse } from './swagger-response.decorator';

/**
 * Combines multiple Swagger decorators into one for easier, DRY documentation.
 * @param options GenerateSwaggerDocOptions for customizing the Swagger doc.
 */
export function GenerateSwaggerDoc(
  options: GenerateSwaggerDocOptions = { summary: '', isOpenRoute: false },
) {
  const decorators = [
    ApiOperation({
      summary: options.summary,
      description: options.description || '',
    }),
  ];

  // Add multipart/form-data consumption if needed
  if (options.consumesMultipart) {
    decorators.push(ApiConsumes('multipart/form-data'));
  }

  // Add custom headers
  const headerArray = options.headers || [];
  headerArray.forEach((header) => {
    decorators.push(
      ApiHeader({
        name: header.name,
        description: header.description,
        required: header.required ?? true,
        example: header.example,
      }),
    );
  });

  // Add security/auth decorators unless route is open
  if (!options.isOpenRoute) {
    const securityArray = options.security ?? [
      {
        key: 'bearerAuth',
        name: 'bearerAuth',
      },
    ];

    for (const security of securityArray) {
      switch (security.key) {
        case 'bearerAuth':
          decorators.push(ApiBearerAuth(security.name));
          break;
        case 'basicAuth':
          decorators.push(ApiBasicAuth(security.name));
          break;
        case 'cookieAuth':
          decorators.push(ApiCookieAuth(security.name));
          break;
        case 'apiKey':
        case 'oauth2':
        case 'openIdConnect':
          decorators.push(ApiSecurity(security.name));
          break;
        default:
          throw new Error(`Unsupported security type: ${security.key}`);
      }
    }
  }

  // Add query parameters
  if (options.query) {
    options.query.forEach((query) => {
      decorators.push(
        ApiQuery({
          ...query,
        }),
      );
    });
  }

  // Add request body options
  if (options.body) {
    options.body.forEach((query) => {
      decorators.push(
        ApiBody({
          ...query,
        }),
      );
    });
  }

  // Add path parameters
  if (options.params) {
    options.params.forEach((param) => {
      decorators.push(
        ApiParam({
          ...param,
        }),
      );
    });
  }

  // Add response documentation
  if (options.responses && options.responses.length > 0) {
    decorators.push(SwaggerResponse(options.responses));
  }

  // Apply all decorators at once
  return applyDecorators(...decorators);
}
