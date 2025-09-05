import { ApiTags } from "@nestjs/swagger";
import {
  AuthUser,
  UserRouteController,
} from "src/common/decorators/app.decorator";
import { FcmTokenService } from "../fcm-token.service";
import { GenerateSwaggerDoc } from "src/common/decorators/swagger-generate.decorator";
import { SuccessResponseNoDataDto } from "src/common/dto/app.dto";
import { Body, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { IAuthRequest } from "src/common/interfaces/app.interface";
import { RegisterFcmTokenDto } from "../dto/register-fcm-token.dto";
import { SuccessResponse } from "src/common/utils/api-response.util";

@ApiTags("Fcm Token Management")
@UserRouteController("fcm-token")
export class FcmTokenUserController {
  constructor(private readonly fcmTokenService: FcmTokenService) {}

  @GenerateSwaggerDoc({
    summary: "Register FCM tokens for a user",
    responses: [
      { status: HttpStatus.OK, type: SuccessResponseNoDataDto },
      { status: HttpStatus.BAD_REQUEST },
      { status: HttpStatus.UNPROCESSABLE_ENTITY },
      { status: HttpStatus.CONFLICT },
      { status: HttpStatus.INTERNAL_SERVER_ERROR },
    ],
  })
  @Post()
  async registerFcmToken(
    @AuthUser() { id, sessionId }: IAuthRequest,
    @Body() { token, deviceType }: RegisterFcmTokenDto
  ) {
    const userId = id;
    await this.fcmTokenService.saveOrUpdateToken(
      userId,
      sessionId,
      token,
      deviceType
    );
    return SuccessResponse("FCM token registered successfully");
  }
}
