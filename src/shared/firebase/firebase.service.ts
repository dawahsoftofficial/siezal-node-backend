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

  constructor(private configService: ConfigService) {}

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
}
