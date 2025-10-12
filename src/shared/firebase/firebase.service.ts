import * as admin from "firebase-admin";
import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { IFcmPayload, IFcmResult } from "./interface/firebase.interface";
import {
  MulticastMessage,
  TokenMessage,
} from "firebase-admin/lib/messaging/messaging-api";

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);
  private database: admin.database.Database;

  constructor(private configService: ConfigService) { }

  async onModuleInit() {
    try {
      const serviceAccount =
        this.configService.getOrThrow<admin.ServiceAccount>(
          "FIREBASE_CREDENTIALS"
        )!;

      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          databaseURL: this.configService.get<string>("FIREBASE_DATABASE_URL"),
        });
        this.logger.log("Firebase initialized successfully.");
      } else {
        this.logger.log("Firebase app already initialized.");
      }

      this.database = admin.database();

      if (this.database) {
        this.logger.log("Connected to Firebase Realtime Database.");
      } else {
        this.logger.error("Failed to connect to Firebase Realtime Database.");
      }
    } catch (error) {
      this.logger.error("Error initializing Firebase:", error);
    }
  }
  /**
   * Send an FCM notification to one or many device tokens.
   * Returns BatchResponse + array of failed tokens
   */
  async sendNotification(
    tokens: string | string[],
    payload: IFcmPayload
  ): Promise<IFcmResult | null> {
    try {
      const tokenList = Array.isArray(tokens) ? tokens : [tokens];
      if (!tokenList.length) {
        this.logger.warn("No FCM tokens provided.");
        return null;
      }

      const data: Record<string, string> = {
        title: payload.title,
        body: payload.body,
        ...(typeof payload.data === 'string' ? JSON.parse(payload.data) : payload.data),
      };

      const message: MulticastMessage = {
        tokens: tokenList,
        notification: {
          title: payload.title,
          body: payload.body,
          imageUrl: payload.imageUrl,
        },

        data: { data: JSON.stringify(data) },
        android: {
          notification: {
            clickAction: payload.clickAction,
            sound: payload.sound ?? "default", // 🔊 Android sound
            icon: payload.icon ?? "ic_launcher",
            priority: "high",
          },
        },
        apns: {
          payload: {
            aps: {
              category: payload.clickAction,
              sound: payload.sound ?? "default", // 🔊 Android sound
              icon: payload.icon ?? "ic_launcher",
            },
          },
        },
      };

      const response = await admin.messaging().sendEachForMulticast(message);
      const failedTokens: string[] = [];

      response.responses.forEach((res, idx) => {
        if (!res.success) {
          failedTokens.push(tokenList[idx]);
          this.logger.warn(
            `Notification failed for token[${idx}]: ${JSON.stringify(res.error?.message)}`
          );
        }
      });

      this.logger.log(
        `Sent notification to ${tokenList.length} device(s). Success: ${response.successCount}, Failure: ${response.failureCount}`
      );

      return { response, failedTokens };
    } catch (error) {
      this.logger.error("Error sending notification:", error);
      return null;
    }
  }
}
