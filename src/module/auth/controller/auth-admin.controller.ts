import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AuthService } from "../auth.service";
import { GenerateSwaggerDoc } from "src/common/decorators/swagger-generate.decorator";
import { AdminRouteController, ApplyHeader } from "src/common/decorators/app.decorator";
import { PublicAuthGuard } from "src/common/guards/public-auth.guard";
import { SuccessResponseSingleObjectWithTokenDto } from "src/common/dto/app.dto";
import { LoginDto } from "../dto/login.dto";
import { SuccessResponse } from "src/common/utils/api-response.util";
import { PublicRouteHeaderDto } from "src/common/dto/public-route-header.dto";

  @ApiTags('Admin/uthentication')
@AdminRouteController('auth')
export class AuthAdminController {
  constructor(private readonly service: AuthService) {}
  @GenerateSwaggerDoc({
    summary: 'Logged In Admin User',
    security: [{ key: 'apiKey', name: 'payload' }],
    responses: [
      { status: HttpStatus.OK, type: SuccessResponseSingleObjectWithTokenDto },
      { status: HttpStatus.BAD_REQUEST },
      { status: HttpStatus.UNPROCESSABLE_ENTITY },
      { status: HttpStatus.INTERNAL_SERVER_ERROR },
    ],
  })
  @HttpCode(200)
  @UseGuards(PublicAuthGuard)
  @ApplyHeader(PublicRouteHeaderDto) //no header validation
  @Post('login')
  async login(@Body() {email,password}: LoginDto) {
    const {token,...response} = await this.service.login(email, password);
  
    return SuccessResponse('Logged In Successfully', response,token);
  }

}