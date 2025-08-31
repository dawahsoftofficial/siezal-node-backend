// Enum for database connection names used in the application
export enum EDBConnectionName {
  /** Main database connection (default) */
  MAIN = "main",
}

// Enum for Redis cache connection names
export enum ERedisConnectionName {
  /** Main Redis cache connection */
  MAIN = "MAIN_CACHE",
}

// Enum for different log types in the application
export enum ELogType {
  /** Logs related to database operations */
  DATABASE = "database",
  /** General application logs */
  GENERAL = "general",
  /** Logs for API request and response cycles */
  API_REQUEST = "api_request_response",
  /**OTP */
  OTP = "otp",
}

// Enum for log levels used throughout the application
export enum ELogLevel {
  /** Informational messages */
  INFO = "info",
  /** Warning messages */
  WARN = "warn",
  /** Error messages */
  ERROR = "error",
  /** Debugging messages */
  DEBUG = "debug",
}
