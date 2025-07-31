/**
 * Common application interfaces and types for authentication, coordinates, and pagination.
 * These are shared across modules for type safety and consistency.
 */
import { Types } from 'mongoose';
import { ERole } from '../enums/role.enum';

// Represents the authenticated user attached to a request (e.g., after JWT validation)
export type IAuthRequest = { id: number; phone:string,email?: string,role:ERole };

// Extends the Express Request interface to include the authenticated user
// Usage: req.user will be available in controllers/middleware
declare module 'express' {
  export interface Request {
    user?: IAuthRequest;
  }
}

// JWT response payload, including issued-at and expiration timestamps
export type IJwtResponse = IAuthRequest & { iat: number; exp: number };

// Represents a geographic coordinate (latitude/longitude)
export interface ICordinate {
  latitude: number;
  longitude: number;
}

// Metadata for paginated API responses
export interface IPaginationMetadata {
  currentPage: number;      // The current page number
  itemsPerPage: number;     // Number of items per page
  totalItems: number;       // Total number of items
  totalPages: number;       // Total number of pages
  hasNextPage: boolean;     // True if there is a next page
  hasPreviousPage: boolean; // True if there is a previous page
}
  