import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

import * as crypto from 'crypto';

@Injectable()
export class AesHelper {
  private readonly AES_IV: string;
  private readonly AES_OPEN: string;

  constructor(
    private configService: ConfigService,
  ) {
    this.AES_IV = this.configService.getOrThrow<string>('AES_IV');
    this.AES_OPEN = this.configService.getOrThrow<string>('AES_OPEN').substring(0, 32);
  }

  encryptData(
    data: string,
    aesOpen?: string,
    aesIv?: string,
    blockSize = 256,
    mode = 'CBC',
  ): string {
    try {
      const method = `AES-${blockSize}-${mode.toLowerCase()}`;
      const open = (aesOpen || this.AES_OPEN).substring(0, 32);
      const iv = (aesIv || this.AES_IV).substring(0, 16);
      this.validateParams(data, open, method);
      const cipher = crypto.createCipheriv(
        method,
        Buffer.from(open, 'utf-8'),
        Buffer.from(iv, 'utf-8'),
      );
      let encrypted = cipher.update(data, 'utf-8', 'base64');
      encrypted += cipher.final('base64');
      return encrypted;
    } catch (error) {
      throw error
    }
  }

  decryptData(
    data: string,
    aesOpen?: string,
    aesIv?: string,
    blockSize = 256,
    mode = 'CBC',
  ): string {
    try {
      const method = `AES-${blockSize}-${mode.toLowerCase()}`;
      const open = (aesOpen || this.AES_OPEN).substring(0, 32);
      const iv = (aesIv || this.AES_IV).substring(0, 16);
      this.validateParams(data, open, method);
      const decipher = crypto.createDecipheriv(
        method,
        Buffer.from(open, 'utf-8'),
        Buffer.from(iv, 'utf-8'),
      );
      let decrypted = decipher.update(data, 'base64', 'utf-8');
      decrypted += decipher.final('utf-8');
      return decrypted;
    } catch (error) {
       throw error
    }
  }

  private validateParams(data: string, key: string, method: string): void {
    if (!data || !key || !method) {
      throw new Error('Invalid parameters for AES encryption!');
    }
  }
}
