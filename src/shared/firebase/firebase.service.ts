import * as admin from 'firebase-admin';
import {
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);
  private database: admin.database.Database;

  constructor(private configService: ConfigService) { }

  async onModuleInit() {
    try {
      const serviceAccount = this.configService.get<admin.ServiceAccount>(
        'FIREBASE_CREDENTIALS',
      )!;

      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          databaseURL: this.configService.get<string>('FIREBASE_DATABASE_URL'),
        });
        this.logger.log('Firebase initialized successfully.');
      } else {
        this.logger.log('Firebase app already initialized.');
      }

      this.database = admin.database();

      if (this.database) {
        this.logger.log('Connected to Firebase Realtime Database.');
      } else {
        this.logger.error('Failed to connect to Firebase Realtime Database.');
      }
    } catch (error) {
      this.logger.error('Error initializing Firebase:', error);
    }
  }

  /**
   * Store OTP in Firebase Realtime Database
   */
  async sendOtp(phone: string, otp: string): Promise<boolean> {
    try {
      const otpData = {
        code: otp,
        createdAt: admin.database.ServerValue.TIMESTAMP,
        expiresAt: Date.now() + 5 * 60 * 1000, // 5 min expiry
      };

      await this.database.ref(`otps/${phone}`).set(otpData);

      this.logger.log(`OTP stored for ${phone}`);

      // Here you can also call a Cloud Function to actually send the SMS
      // await axios.post(process.env.FIREBASE_CLOUD_FUNCTION_URL, { phone, otp });

      return true;
    } catch (error) {
      this.logger.error(`Failed to store OTP for ${phone}:`, error);
      throw error;
    }
  }
}
