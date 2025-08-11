import { Get, HttpCode, HttpStatus, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { SettingService } from "../setting.service";
import { GenerateSwaggerDoc } from "src/common/decorators/swagger-generate.decorator";
import { SuccessResponseSingleObjectDto } from "src/common/dto/app.dto";
import { PublicRouteController } from "src/common/decorators/app.decorator";
import { GuestAuthGuard } from "src/common/guards/guest-auth.guard";
import { SuccessResponse } from "src/common/utils/api-response.util";

@ApiTags("Settings Management")
@PublicRouteController("settings")
export class SettingController {
  constructor(private readonly settingService: SettingService) {}

  @GenerateSwaggerDoc({
    summary: "Get homepage settings",

    security: [
      { key: "apiKey", name: "payload" },
      {
        key: "bearerAuth",
        name: "bearerAuth",
      },
    ],
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
  @UseGuards(GuestAuthGuard)
  async getHomepageSettings() {
    const response = await this.settingService.getHomepageSettings();
    return SuccessResponse("Setting Data Fetched", response);
  }
}
