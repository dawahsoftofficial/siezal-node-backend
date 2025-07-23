/**
 * Swagger query parameter definition for pagination page number.
 * Use this in Swagger decorators (e.g., @ApiQuery) to document the 'page' query parameter.
 */
export const PageQueryParam = {
    name: 'page',
    description: '1,2,...,10 default 1',
    type: 'number',
    required: false,
    example: 1,
  };
  
/**
 * Swagger query parameter definition for pagination limit.
 * Use this in Swagger decorators (e.g., @ApiQuery) to document the 'limit' query parameter.
 */
export const LimitQueryParam = {
  name: 'limit',
  description: '10,20,...,50 default 10',
  type: 'number',
  required: false,
  example: 1,
};

/**
 * Swagger query parameter definition for resource ID.
 * Use this in Swagger decorators (e.g., @ApiParam) to document the 'id' path parameter.
 */
export const IdParam = {
  name: 'id',
  description: 'ID for the request',
  required: true,
  example: 1,
};