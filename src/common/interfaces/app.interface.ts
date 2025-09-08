/**
 * Common application interfaces and types for authentication, coordinates, and pagination.
 * These are shared across modules for type safety and consistency.
 */

import { IUser } from "src/module/user/interface/user.interface";
import { ERole } from "../enums/role.enum";

// Represents the authenticated user attached to a request (e.g., after JWT validation)
export type IAuthRequest = {
  sessionId: string;
  id: number;
  phone: string;
  email?: string | null;
  role: ERole;
};

// Extends the Express Request interface to include the authenticated user
// Usage: req.user will be available in controllers/middleware
declare module "express" {
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
  currentPage: number; // The current page number
  itemsPerPage: number; // Number of items per page
  totalItems: number; // Total number of items
  totalPages: number; // Total number of pages
  hasNextPage: boolean; // True if there is a next page
  hasPreviousPage: boolean; // True if there is a previous page
}

export interface IPaginatedResponse<T> {
  data: T[];
  pagination: IPaginationMetadata;
}

type VerificationResult = { type: "verification"; verifiedAt: boolean };

type SuccessResult = IUser & {
  type: "success";
  token: {
    accessToken: string;
    refreshToken: string;
    expiry: number;
  };
};

export type LoginResult = VerificationResult | SuccessResult;
