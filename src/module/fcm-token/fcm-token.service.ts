import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BaseSqlService } from "src/core/base/services/sql.base.service";
import { FcmToken } from "src/database/entities/fcm-token.entity";
import { In, Repository } from "typeorm";
import { IFcmToken } from "./interface/fcm-token.interface";
import { EDeviceType } from "src/common/enums/device-type.enum";

@Injectable()
export class FcmTokenService extends BaseSqlService<FcmToken, IFcmToken> {
  constructor(
    @InjectRepository(FcmToken)
    private readonly fcmTokenRepository: Repository<FcmToken>
  ) {
    super(fcmTokenRepository);
  }

  saveOrUpdateToken = async (
    userId: number,
    userSessionId: string,
    token: string,
    deviceType: EDeviceType
  ) => {
    const existingToken = await this.fcmTokenRepository.findOne({
      where: { userId, userSessionId },
    });
    if (existingToken && existingToken.token === token) {
      return existingToken;
    }
    if (existingToken) {
      existingToken.token = token;
      existingToken.deviceType = deviceType;
      return this.fcmTokenRepository.save(existingToken);
    }
    const newToken = this.create({
      userId,
      token,
      deviceType,
      userSessionId,
    });
    return newToken;
  };

  deleteToken = async (userSessionId: string) => {
    return this.deleteMany({ userSessionId });
  };

  deleteFailedTokens = async (tokens: string[]) => {
    return this.deleteMany({ token: In(tokens) });
  };

  getTokensByUserIds = async (userIds: number[]): Promise<string[]> => {
    const data = await this.findAll({
      where: {
        userId: In(userIds),
      },
      select: {
        token: true,
      },
    });
    return data?.map((item) => item.token);
  };
}
