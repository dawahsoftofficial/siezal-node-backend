import { Body, Get, HttpCode, HttpStatus, Patch, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { SettingService } from "../setting.service";
import { GenerateSwaggerDoc } from "src/common/decorators/swagger-generate.decorator";
import { SuccessResponseSingleObjectDto } from "src/common/dto/app.dto";
import { AdminRouteController } from "src/common/decorators/app.decorator";
import { SuccessResponse } from "src/common/utils/api-response.util";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { UpdateHomepageSettingsDto } from "../dto/update-homepage.dto";

@ApiTags("Admin Settings Management")
@AdminRouteController("settings")
export class AdminSettingController {
  constructor(private readonly settingService: SettingService) { }

  @GenerateSwaggerDoc({
    summary: "Get homepage settings",
    responses: [
      { status: HttpStatus.OK, type: SuccessResponseSingleObjectDto },
      { status: HttpStatus.BAD_REQUEST },
      { status: HttpStatus.UNPROCESSABLE_ENTITY },
      { status: HttpStatus.CONFLICT },
      { status: HttpStatus.INTERNAL_SERVER_ERROR },
    ],
  })
  @Get("homepage")
  @HttpCode(HttpStatus.OK)
  async getHomepageSettings() {
    const response = await this.settingService.getHomepageSettingsAdmin();
    return SuccessResponse("Setting Data Fetched", response);
  }

  @GenerateSwaggerDoc({
    summary: "Update homepage settings (slider images)",
    isOpenRoute: true,
    consumesMultipart: true,
    responses: [
      { status: HttpStatus.OK, type: SuccessResponseSingleObjectDto },
      { status: HttpStatus.BAD_REQUEST },
      { status: HttpStatus.UNPROCESSABLE_ENTITY },
      { status: HttpStatus.CONFLICT },
      { status: HttpStatus.INTERNAL_SERVER_ERROR },
    ],
  })
  @Patch("homepage")
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileFieldsInterceptor([{ name: "newImages[]", maxCount: 10 }])
  )
  async saveHomepageSettings(
    @UploadedFiles() files: { "newImages[]"?: Express.Multer.File[] },
    @Body() dto: UpdateHomepageSettingsDto,
  ) {
    const urls = Array.isArray(dto.existingUrls) ? dto.existingUrls : dto.existingUrls ? [dto.existingUrls] : [];

    const response = await this.settingService.saveHomepageSettingsAdmin(
      urls,
      files?.["newImages[]"] ?? [],
    );

    return SuccessResponse("Settings updated successfully", response);
  }
}
