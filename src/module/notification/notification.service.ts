import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { FirebaseService } from "src/shared/firebase/firebase.service";
import { SendNotificationDto } from "./dto/send-notification.dto";
import { S3Service } from "src/shared/aws/s3.service";
import { IFcmPayload } from "src/shared/firebase/interface/firebase.interface";
import { FcmTokenService } from "../fcm-token/fcm-token.service";

@Injectable()
export class NotificationService {
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly s3Service: S3Service,
    private readonly fcmService: FcmTokenService
  ) {}

  sendNotification = async (
    payload: SendNotificationDto,
    image?: Express.Multer.File
  ) => {
    const { userIds, ...rest } = payload;
    const notificationData: IFcmPayload = { ...rest };
    if (image && image.buffer instanceof Buffer) {
      const { url } = await this.s3Service.uploadImage(image);
      notificationData.imageUrl = url;
    }
    const tokens = await this.fcmService.getTokensByUserIds(userIds);
    console.log(tokens, "tokens", notificationData);
    if (tokens.length > 0) {
      const response = await this.firebaseService.sendNotification(
        tokens,
        notificationData
      );
      if (!response) {
        throw new InternalServerErrorException("Something Went Wrong");
      }
      if (response && response.failedTokens.length > 0) {
        await this.fcmService.deleteFailedTokens(response.failedTokens);
      }
      return;
    }
    throw new NotFoundException("Token Not Found for given users");
  };
}
