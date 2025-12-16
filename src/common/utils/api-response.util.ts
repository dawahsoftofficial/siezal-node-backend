/**
 * Utility class for building standardized API responses.
 * Use these static methods to format success and custom responses consistently.
 */
import { IPaginationMetadata } from "../interfaces/app.interface";
import { convertTimestampsInResponse } from "./app.util";
import { currentDateTime } from "./date.util";

/**
 * Builds a standard success response with optional data, tokens, and extra fields.
 */
export function SuccessResponse<T>(
  message: string,
  data?: T,
  tokens?: {
    accessToken?: string;
    refreshToken?: string;
    resetPasswordToken?: string;
    expiry?: number;
  },
  pagination?: IPaginationMetadata,
  extra?: any
) {
  const converted = convertTimestampsInResponse(data);
  return {
    success: true,
    message,
    data: converted,
    ...(tokens ?? {}),
    ...(extra ? { extra } : {}),
    ...(pagination ? { pagination } : {}),
    timestamp: currentDateTime(),
  };
}
