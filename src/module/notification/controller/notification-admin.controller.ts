import { ApiTags } from "@nestjs/swagger";
import { AdminRouteController } from "src/common/decorators/app.decorator";
import { NotificationService } from "../notification.service";
import {
  Body,
  HttpCode,
  HttpStatus,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { SuccessResponseNoDataDto } from "src/common/dto/app.dto";
import { GenerateSwaggerDoc } from "src/common/decorators/swagger-generate.decorator";
import { SendNotificationDto } from "../dto/send-notification.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { SuccessResponse } from "src/common/utils/api-response.util";

@ApiTags("Admin General Notifications")
@AdminRouteController("notification")
export class NotificationAdminController {
  constructor(private readonly service: NotificationService) {}

  @GenerateSwaggerDoc({
    summary: "Send  General Notification user",
    consumesMultipart: true,

    responses: [
      { status: HttpStatus.OK, type: SuccessResponseNoDataDto },
      { status: HttpStatus.BAD_REQUEST },
      { status: HttpStatus.UNPROCESSABLE_ENTITY },
      { status: HttpStatus.INTERNAL_SERVER_ERROR },
    ],
  })
  @HttpCode(200)
  @Post("send")
  @UseInterceptors(FileInterceptor("image"))
  async sendNotification(
    @Body() payload: SendNotificationDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
      })
    )
    uploadedImage: Express.Multer.File
  ) {
    const { image, ...data } = payload;
    await this.service.sendNotification(data, uploadedImage);
    return SuccessResponse("Notification Send Successfully");
  }
}
