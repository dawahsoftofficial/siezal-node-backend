import { Get, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PublicAuthGuard } from 'src/common/guards/public-auth.guard';
import { SettingService } from '../setting.service';
import { GenerateSwaggerDoc } from 'src/common/decorators/swagger-generate.decorator';
import { SuccessResponseSingleObjectDto } from 'src/common/dto/app.dto';
import { UserRouteController } from 'src/common/decorators/app.decorator';

@ApiTags('Settings Management')
@UserRouteController('settings')
export class UserSettingController {
    constructor(private readonly settingService: SettingService) { }

    @GenerateSwaggerDoc({
        summary: "Get homepage settings",
        security: [{ key: "apiKey", name: "payload" }],
        responses: [
            { status: HttpStatus.OK, type: SuccessResponseSingleObjectDto },
            { status: HttpStatus.BAD_REQUEST },
            { status: HttpStatus.UNPROCESSABLE_ENTITY },
            { status: HttpStatus.CONFLICT },
            { status: HttpStatus.INTERNAL_SERVER_ERROR },
        ],
    })
    @Get('homepage')
    @HttpCode(HttpStatus.OK)
    @UseGuards(PublicAuthGuard)
    async getHomepageSettings() {
        return this.settingService.getHomepageSettings();
    }
}
