import {
  Body,
  Controller,
  Get,
  HttpStatus,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { AppService } from "./app.service";
import {
  FileField,
  ApplyHeader,
  NoGuard,
} from "./common/decorators/app.decorator";
import { GenerateSwaggerDoc } from "./common/decorators/swagger-generate.decorator";
import { SuccessResponseNoDataDto } from "./common/dto/app.dto";
import { SuccessResponse } from "./common/utils/api-response.util";
import { FileInterceptor } from "@nestjs/platform-express";

class ImageSwaggerDto {
  @FileField("profileImage", { required: true })
  profileImage?: Express.Multer.File; // 👈 dummy field just for Swagger
}
@NoGuard() //no guard because by default we have jwt guard
@ApplyHeader() //no heade valdiation
@Controller("")
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get("health-check")
  @GenerateSwaggerDoc({
    summary: "Health check route",
    isOpenRoute: true,
    responses: [
      {
        status: HttpStatus.OK,
        description: "Api Running successfully",
        type: SuccessResponseNoDataDto,
      },
      { status: HttpStatus.INTERNAL_SERVER_ERROR },
    ],
  })
  getHello() {
    const message = this.appService.getHello();
    return SuccessResponse(message);
  }

  @GenerateSwaggerDoc({
    summary: "image upload example route",
    isOpenRoute: true,
    consumesMultipart: true,
    responses: [
      {
        status: HttpStatus.OK,
      },
      { status: HttpStatus.INTERNAL_SERVER_ERROR },
    ],
  })
  @Post("image-example")
  @UseInterceptors(FileInterceptor("profileImage"))
  async updateProfile(
    @Body() dto: ImageSwaggerDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: true,
      })
    )
    profileImage: Express.Multer.File
  ) {
    console.log(profileImage);
    const data = await this.appService.uploadImageExample(profileImage!);
    return SuccessResponse("image", data);
  }
}
