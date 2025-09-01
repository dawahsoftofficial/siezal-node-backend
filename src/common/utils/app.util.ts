/**
 * Utility functions for common operations such as hashing, random generation, validation, and data transformation.
 * These helpers are used throughout the application for security, formatting, and data processing.
 */
import * as bcrypt from "bcrypt";
import * as crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import * as haversineDistance from "haversine-distance";
import * as _ from "lodash";
import { ValidationError } from "class-validator";
import { ICordinate } from "../interfaces/app.interface";
import { instanceToPlain, Transform } from "class-transformer";
import { ESettingType } from "../enums/setting-type.enum";

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
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const charactersLength = characters.length;
  let randomString = "";
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
  saltRounds: number = 12
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
  hashedPassword: string
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
  point2: ICordinate
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
  const field = ["accessToken", "refreshToken", "password", "otp"];
  let plainData: any;
  if (Array.isArray(data)) {
    plainData = data.map((item) =>
      typeof item === "object" ? instanceToPlain(item) : item
    );
  } else if (typeof data === "object" && data !== null) {
    plainData = instanceToPlain(data);
  } else {
    plainData = data;
  }
  const response = filterSensitiveData(plainData, field, true);

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
  removeField = false
): any {
  if (data === null || data === undefined) return data;

  const lowerCaseSensitiveFields = sensitiveFields.map((field) =>
    field.toLowerCase()
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
            result[key] = "****"; // Mask sensitive value
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
  parentPath = ""
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
  return crypto.createHash("sha256").update(input).digest("hex");
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
  const digits = "0123456789";
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += digits[crypto.randomInt(0, 10)];
  }
  return otp;
}

/**
 * Parses a setting value based on its type.
 * @param value The raw value from the setting.
 * @param type The type of the setting (e.g., STRING, NUMBER, BOOLEAN, JSON).
 * @returns The parsed value in the appropriate format.
 */
export function parseSettingValue(value: string, type: ESettingType) {
  switch (type) {
    case ESettingType.NUMBER:
      return Number(value);
    case ESettingType.BOOLEAN:
      return value === "true";
    case ESettingType.JSON:
      try {
        return JSON.parse(value);
      } catch {
        return null;
      }
    case ESettingType.STRING:
    default:
      return value;
  }
}

function coerceBoolean(raw: unknown): boolean {
  if (typeof raw === "boolean") return raw;
  if (typeof raw === "string") {
    const v = raw.trim().toLowerCase();
    if (["true", "1", "yes", "on"].includes(v)) return true;
    if (["false", "0", "no", "off", ""].includes(v)) return false;
  }
  if (typeof raw === "number") return raw === 1;
  return false;
}

export const ToBoolean = () =>
  Transform(
    ({ value, obj, key }) => {
      // Use the *raw* incoming value to bypass implicit conversion
      const raw = obj?.[key as keyof typeof obj];
      return coerceBoolean(raw ?? value);
    },
    { toClassOnly: true }
  );

export const generateOrderUID = (): string => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const digits = "0123456789";

  let result = "";

  for (let i = 0; i < 3; i++) {
    result += letters.charAt(Math.floor(Math.random() * letters.length));
    result += digits.charAt(Math.floor(Math.random() * digits.length));
  }

  return `SZ-${result}`;
};

export const normalizePakistaniPhone = (phone: string): string | null => {
  if (!phone) return null;

  // remove spaces, dashes, etc.
  let cleaned = phone.replace(/\D/g, "");

  // if starts with 92 and length is 12 -> valid
  if (cleaned.startsWith("92") && cleaned.length === 12) {
    return "+" + cleaned;
  }

  // if starts with 0 -> replace with +92
  if (cleaned.startsWith("0") && cleaned.length === 11) {
    return "+92" + cleaned.slice(1);
  }

  // if missing 0 and length is 10 -> add +92
  if (cleaned.length === 10) {
    return "+92" + cleaned;
  }

  return null; // invalid format
};

export function generateOtpMessage(otp: string): string {
  return `Your Siezal verification code is ${otp}. 
Do not share this code with anyone.`;
}

export const generateSessionId = () => {
  return uuidv4();
};
