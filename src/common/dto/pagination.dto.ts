/**
 * DTO for handling pagination query parameters and generating pagination metadata.
 * Used for validating and transforming pagination input in API requests.
 */
import { IsNumber, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { IPaginationMetadata } from '../interfaces/app.interface';

/**
 * Pagination DTO for query parameters and metadata generation.
 */
export class PaginationDto {
  /**
   * Page number (default: 1)
   */
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1, { message: 'Page must be at least 1' })
  page: number = 1;

  /**
   * Number of items per page (default: 10, max: 100)
   */
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit cannot exceed 100' })
  limit: number = 10;

  /**
   * Calculates skip value for database queries
   */
  get skip(): number {
    return (this.page - 1) * this.limit;
  }

  /**
   * Generates pagination metadata for API responses
   * @param totalItems Total number of items in the collection
   * @returns Pagination metadata object
   */
  getMetadata(totalItems: number): IPaginationMetadata {
    const totalPages = Math.ceil(totalItems / this.limit);
    return {
      currentPage: this.page,
      itemsPerPage: this.limit,
      totalItems,
      totalPages,
      hasNextPage: this.page < totalPages,
      hasPreviousPage: this.page > 1,
    };
  }
}
