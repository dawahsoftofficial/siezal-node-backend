/**
 * Interfaces for defining Swagger/OpenAPI documentation options in a type-safe way.
 * These interfaces help standardize how headers, responses, and other options are described for Swagger decorators and doc generation.
 */
import { HttpStatus, Type } from '@nestjs/common';
import {
  ApiBodyOptions,
  ApiParamOptions,
  ApiQueryOptions,
} from '@nestjs/swagger';
import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';


/**
 * Represents a custom header option for Swagger documentation.
 */
export interface SwaggerHeaderOption {
  name: string;           // Header name
  description: string;    // Header description
  required?: boolean;     // Is the header required? (default: true)
  example?: string;       // Example value for the header
}

/**
 * Represents a response option for Swagger documentation.
 */
export interface SwaggerResponseOption {
  status: HttpStatus;     // HTTP status code for the response
  description?: string;   // Description of the response
  type?: any;   
schema?:SchemaObject & Partial<SchemaObject>;       // Response type (DTO/class)
}

/**
 * Options for generating a Swagger doc for a route or controller.
 */
export interface GenerateSwaggerDocOptions {
  summary: string;                        // Short summary of the endpoint
  description?: string;                   // Detailed description
  headers?: SwaggerHeaderOption[];        // Custom headers for the endpoint
  responses?: SwaggerResponseOption[];    // Possible responses
  query?: ApiQueryOptions[];              // Query parameters
  params?: ApiParamOptions[];             // Path parameters
  body?: ApiBodyOptions[];                // Request body options
  security?: {
    key:
      | 'basicAuth'
      | 'cookieAuth'
      | 'bearerAuth'
      | 'apiKey'
      | 'oauth2'
      | 'openIdConnect';
    name: string;
  }[];                                    // Security schemes for the endpoint
  isOpenRoute?: boolean;                  // If true, route is public (no auth)
  consumesMultipart?: boolean;            // If true, route consumes multipart/form-data
}
