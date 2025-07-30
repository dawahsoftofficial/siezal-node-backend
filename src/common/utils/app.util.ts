/**
 * Utility functions for common operations such as hashing, random generation, validation, and data transformation.
 * These helpers are used throughout the application for security, formatting, and data processing.
 */
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as haversineDistance from 'haversine-distance';
import * as _ from 'lodash';
import { ValidationError } from 'class-validator';
import { ICordinate } from '../interfaces/app.interface';

/**
 * Generates a random 5-digit integer between 10000 and 99999.
 */
export const generateRandomInteger = (): number => {
  return Math.floor(10000 + Math.random() * 90000); // Generates a 5-digit number between 10000 and 99999
};

/**
 * Generates a random alphanumeric string of the specified length (default: 10).
 * @param length Length of the string to generate.
 * @returns Random alphanumeric string.
 */
export const generateRandomString = (length = 10): string => {
  const characters =
    '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const charactersLength = characters.length;
  let randomString = '';
  for (let i = 0; i < length; i++) {
    randomString += characters[Math.floor(Math.random() * charactersLength)];
  }

  return randomString;
};

/**
 * Hashes a password using bcrypt.
 * @param password The plain text password.
 * @param saltRounds Number of salt rounds (default: 12).
 * @returns The hashed password.
 */
export const hashBcrypt = async (
  password: string,
  saltRounds: number = 12,
): Promise<string> => {
  return await bcrypt.hash(password, saltRounds);
};

/**
 * Verifies a password against a hashed password using bcrypt.
 * @param password The plain text password.
 * @param hashedPassword The hashed password to compare against.
 * @returns True if the password matches, false otherwise.
 */
export const verifyPassword = async (
  password: string,
  hashedPassword: string,
): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

/**
 * Calculates the distance in kilometers between two coordinates using the Haversine formula.
 * @param point1 First coordinate.
 * @param point2 Second coordinate.
 * @returns Distance in kilometers.
 */
export const calculateDistance = (
  point1: ICordinate,
  point2: ICordinate,
): number => {
  const distanceInMeters = haversineDistance(point1, point2);
  return distanceInMeters / 1000; // Convert meters to kilometers
};

/**
 * Removes or masks sensitive fields from an object or array.
 * @param data The data to process.
 * @returns The data with sensitive fields removed or masked.
 */
export const removeSensitiveData = (data: any): any => {
  const field = ['accessToken', 'refreshToken', 'password', 'otp'];

  const response = filterSensitiveData(data, field, true);
  
  return response;
};

/**
 * Filters sensitive fields from data, either masking or removing them.
 * @param data The data to process (object, array, etc.).
 * @param sensitiveFields List of field names to filter.
 * @param removeField If true, removes the field; if false, masks the value.
 * @returns The processed data.
 */
export function filterSensitiveData(
  data: any, // Accept any input type (object, array, etc.)
  sensitiveFields: string[],
  removeField = false,
): any {
  if (data === null || data === undefined) return data;

  const lowerCaseSensitiveFields = sensitiveFields.map((field) =>
    field.toLowerCase(),
  );

  const clean = (value: any): any => {
    if (Array.isArray(value)) {
      return value.map((item) => clean(item));
    }
    

    if (_.isPlainObject(value)) {
      const result: Record<string, any> = {};

      for (const [key, val] of Object.entries(value)) {
     
        if (!Object.prototype.hasOwnProperty.call(value, key)) continue;

        if (lowerCaseSensitiveFields.includes(key.toLowerCase())) {
          if (!removeField) {
            result[key] = '****'; // Mask sensitive value
          }
          // else: skip adding the key (i.e., remove it)
        } else {
          result[key] = clean(val); // Recurse
        }
      }

      return result;
    }

    return value; // Return primitives as-is
  };



  return clean(_.cloneDeep(data));
}

/**
 * Formats validation errors from class-validator into an array of messages.
 * @param errors Array of ValidationError objects.
 * @param parentPath Used for nested error paths (optional).
 * @returns Array of error messages.
 */
export const formatValidationErrors = (
  errors: ValidationError[],
  parentPath = '',
): string[] => {
  const messages: string[] = [];

  for (const error of errors) {
    const fieldPath = parentPath
      ? `${parentPath}.${error.property}`
      : error.property;

    if (error.constraints) {
      for (const msg of Object.values(error.constraints)) {
        messages.push(`${msg}`);
      }
    }

    if (error.children && error.children.length > 0) {
      messages.push(...formatValidationErrors(error.children, fieldPath));
    }
  }

  return messages;
};

/**
 * Hashes a string using SHA-256.
 * @param input The string to hash.
 * @returns The resulting hash as a hex string.
 */
export const hashString = (input: string) => {
  return crypto.createHash('sha256').update(input).digest('hex');
};

/**
 * Generates a numeric One-Time Password (OTP) of a specified length.
 *
 * This function creates a secure OTP using cryptographically strong random numbers.
 * The OTP consists only of digits (0–9).
 *
 * @param {number} [length=6] - The length of the OTP to generate. Defaults to 6 digits.
 * @returns {string} A string representing the generated numeric OTP.
 *
 * @example
 * generateOtp();       // "483920"
 * generateOtp(4);      // "1947"
 */
export function generateOtp(length = 6): string {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[crypto.randomInt(0, 10)];
  }
  return otp;
}