/**
 * Utility class for building standardized API responses.
 * Use these static methods to format success and custom responses consistently.
 */
import { currentDateTime } from './date.util';

/**
 * Builds a standard success response with optional data, tokens, and extra fields.
 */
export function SuccessResponse<T>(
  message: string,
  data?: T,
  tokens?: { accessToken?: string; refreshToken?: string,resetPasswordToken?: string },
  extra?: any,
) {
  return {
    success: true,
    message,
    data,
    ...(tokens ?? {}),
    ...(extra ? { extra } : {}),
    timestamp: currentDateTime(),
  };
}

