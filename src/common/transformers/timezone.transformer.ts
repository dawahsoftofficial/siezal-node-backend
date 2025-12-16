// transformers/image-url.transformer.ts
import { ValueTransformer } from "typeorm";
import { convertToTimeZone, now } from "../utils/date.util";

/**
 * TypeORM ValueTransformer for handling image URLs stored in the database.
 * Converts stored image file names to full URLs using a CDN base URL from config.
 */
export class TimezoneTransformer implements ValueTransformer {
  /**
   * Called when saving to the database. Returns the value as-is.
   * @param value The image file name or URL.
   * @returns The value to store in the database.
   */
  to(value: Date | string | null): Date | string | null {
    return value;
  }

  /**
   * Called when retrieving from the database. Converts file name to full CDN URL.
   * @param value The image file name or URL from the database.
   * @returns The full image URL or null if value is empty.
   */
  from(value: Date | string | null): Date | string | null {
    if (!value) return null;
    return convertToTimeZone(value);
  }
}
