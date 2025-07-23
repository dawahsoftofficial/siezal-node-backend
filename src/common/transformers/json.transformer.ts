// transformers/json.transformer.ts
import { ValueTransformer } from 'typeorm';

/**
 * TypeORM ValueTransformer for storing and retrieving JSON objects in the database.
 * Converts objects to JSON strings for storage and parses them back on retrieval.
 */
export class JsonTransformer implements ValueTransformer {
  /**
   * Converts a JavaScript object to a JSON string for storing in the database.
   * @param value The value to be stored.
   * @returns JSON string or null if value is falsy.
   */
  to(value: any): string | null {
    // Store as JSON string in DB
    return value ? JSON.stringify(value) : null;
  }

  /**
   * Parses a JSON string from the database back into a JavaScript object.
   * @param value The value retrieved from the database.
   * @returns Parsed object or empty object if parsing fails or value is null.
   */
  from(value: string | null): {} {
    if (!value) return {};
    try {
      return typeof value === 'string' ? JSON.parse(value) : value;
    } catch {
      return {};
    }
  }
}
