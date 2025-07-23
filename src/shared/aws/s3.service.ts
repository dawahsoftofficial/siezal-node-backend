// src/aws/s3.service.ts
import {
  Injectable,
  BadRequestException,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import * as sharp from 'sharp';

@Injectable()
export class S3Service implements OnModuleInit {
  private readonly logger = new Logger(S3Service.name);
  private s3Client: S3Client;
  private bucketName: string;
  private region: string;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    try {
      this.bucketName = this.configService.getOrThrow<string>('AWS_S3_BUCKET');
      this.region = this.configService.getOrThrow<string>('AWS_S3_REGION');

      this.s3Client = new S3Client({
        region: this.region,
      });
      this.logger.log('S3 Service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize S3 Service', error.stack);
      throw error;
    }
  }

  /**
   * Upload image to S3 with optional compression and resizing
   * @param file Express Multer file
   * @param folder Destination folder in S3
   * @param options Upload options
   * @returns S3 object key and URL
   */
  async uploadImage(
    file: Express.Multer.File,
    folder: string = 'uploads',
    options?: {
      compress?: boolean;
      width?: number;
      height?: number;
      format?: 'jpeg' | 'png' | 'webp';
      quality?: number;
    },
  ): Promise<{ key: string; url: string }> {
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('File must be an image');
    }

    try {
      // Generate unique filename
      const extension = file.originalname.split('.').pop() || 'jpg';
      const key = `${folder}/${uuidv4()}_${this.configService.get('NODE_ENV')}.${extension}`;

      // Process image if options provided
      let imageBuffer = file.buffer;
      if (options?.compress || options?.width || options?.height) {
        imageBuffer = await sharp(file.buffer)
          .resize(options.width, options.height, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .toFormat(options.format || 'jpeg', {
            quality: options.quality || 80,
          })
          .toBuffer();
      }

      // Upload to S3

      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: imageBuffer,
          ContentType: file.mimetype,
          ACL: this.configService.get('AWS_S3_ACL') ?? 'public-read',
        }),
      );

      return {
        key,
        url: this.getPublicUrl(key),
      };
    } catch (error) {
      this.logger.error(`Upload failed: ${error.message}`, error.stack);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new Error('Failed to process image upload');
    }
  }

  /**
   * Generate pre-signed URL for private objects
   * @param key S3 object key
   * @param expiresIn URL expiration in seconds (default: 3600)
   */
  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });
    return getSignedUrl(this.s3Client, command, { expiresIn });
  }

  /**
   * Delete file from S3
   * @param key S3 object key
   */
  async deleteFile(key: string): Promise<void> {
    await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      }),
    );
  }

  private getPublicUrl(key: string): string {
    const cdnUrl = this.configService.get<string>('AWS_S3_CDN');
    if (cdnUrl) {
      return `${cdnUrl}/${key}`;
    }
    return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;
  }
}
