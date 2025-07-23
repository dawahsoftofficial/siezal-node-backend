// transformers/image-url.transformer.ts
import { ValueTransformer } from 'typeorm';
import { ConfigService } from '@nestjs/config';

/**
 * TypeORM ValueTransformer for handling image URLs stored in the database.
 * Converts stored image file names to full URLs using a CDN base URL from config.
 */
export class ImageUrlTransformer implements ValueTransformer {
  /**
   * ConfigService instance for accessing environment/config variables.
   */
  private readonly configService: ConfigService;

  /**
   * @param folder Optional folder name to prepend to the image path.
   */
  constructor(private folder: string | null = null) {
    this.configService = new ConfigService();
  }

  /**
   * Called when saving to the database. Returns the value as-is.
   * @param value The image file name or URL.
   * @returns The value to store in the database.
   */
  to(value: string | null): string | null {
    // Transform when saving to DB (if needed)
    return value;
  }

  /**
   * Called when retrieving from the database. Converts file name to full CDN URL.
   * @param value The image file name or URL from the database.
   * @returns The full image URL or null if value is empty.
   */
  from(value: string | null): string | null {
    if (!value) return null;

    // Get base URL from the config (AWS_S3_CDN)
    const baseUrl = this.configService.get('AWS_S3_CDN');

    // If folder is provided, use it, otherwise don't
    const folderPath = this.folder ? `${this.folder}` : '';

    // Return the final image URL
    return value.startsWith('http')
      ? value
      : `${baseUrl}/${folderPath}/${value}`;
  }
}
