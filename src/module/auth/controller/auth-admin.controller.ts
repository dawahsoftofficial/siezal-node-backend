import { Body, Get, HttpCode, HttpStatus, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AuthService } from "../auth.service";
import { GenerateSwaggerDoc } from "src/common/decorators/swagger-generate.decorator";
import { AdminRouteController, ApplyHeader, AuthUser } from "src/common/decorators/app.decorator";
import { PublicAuthGuard } from "src/common/guards/public-auth.guard";
import { SuccessResponseNoDataDto, SuccessResponseSingleObjectDto, SuccessResponseSingleObjectWithTokenDto, SuccessResponseTokenDto } from "src/common/dto/app.dto";
import { LoginAdminDto } from "../dto/login-admin.dto";
import { SuccessResponse } from "src/common/utils/api-response.util";
import { PublicRouteHeaderDto } from "src/common/dto/public-route-header.dto";
import { ERole } from "src/common/enums/role.enum";
import { IAuthRequest } from "src/common/interfaces/app.interface";
import { AccessTokenDto } from "../dto/access-token.dto";
import { UpdateUserDto } from "src/module/user/dto/update-user.dto";

@ApiTags('Admin Authentication')
@AdminRouteController('auth')
export class AuthAdminController {
  constructor(private readonly service: AuthService) { }
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
  async login(@Body() { email, password }: LoginAdminDto) {
    const { token, ...response } = await this.service.login(email, password, ERole.ADMIN);

    return SuccessResponse('Logged In Successfully', response, token);
  }

  @GenerateSwaggerDoc({
    summary: 'Logout user',
    responses: [
      { status: HttpStatus.OK, type: SuccessResponseNoDataDto },
      { status: HttpStatus.BAD_REQUEST },
      { status: HttpStatus.UNPROCESSABLE_ENTITY },
      { status: HttpStatus.INTERNAL_SERVER_ERROR },
    ],
  })
  @HttpCode(200)
  @Post('logout')
  async logout(@AuthUser() { id, role }: IAuthRequest) {
    await this.service.logout(role, id);
    return SuccessResponse("Logged out successfully");
  }

  @GenerateSwaggerDoc({
    summary: "Get updated access token on expiration",
    responses: [
      { status: HttpStatus.OK, type: SuccessResponseTokenDto },
      { status: HttpStatus.BAD_REQUEST },
      { status: HttpStatus.UNPROCESSABLE_ENTITY },
      { status: HttpStatus.INTERNAL_SERVER_ERROR },
    ],
  })
  @HttpCode(200)
  @Post("access-token")
  async accessToken(@Body() { refreshToken }: AccessTokenDto) {
    const response = await this.service.accessToken(refreshToken);
    return SuccessResponse("Token reset successful", {}, response);
  }

  @GenerateSwaggerDoc({
    summary: "Get my details",
    responses: [
      { status: HttpStatus.OK, type: SuccessResponseSingleObjectDto },
      { status: HttpStatus.BAD_REQUEST },
      { status: HttpStatus.UNPROCESSABLE_ENTITY },
      { status: HttpStatus.INTERNAL_SERVER_ERROR },
    ],
  })
  @HttpCode(200)
  @Get("/my-profile")
  async myProfile(@AuthUser() { id }: IAuthRequest) {
    const response = await this.service.getProfile(id);
    return SuccessResponse("Data Fetched Succesfully!", response);
  }

  @GenerateSwaggerDoc({
    summary: "Update user details",
    responses: [
      { status: HttpStatus.OK, type: SuccessResponseSingleObjectDto },
      { status: HttpStatus.BAD_REQUEST },
      { status: HttpStatus.UNPROCESSABLE_ENTITY },
      { status: HttpStatus.CONFLICT },
      { status: HttpStatus.INTERNAL_SERVER_ERROR },
    ],
  })
  @Patch("/update-profile")
  @HttpCode(HttpStatus.OK)
  async updateUser(
    @AuthUser() { id }: IAuthRequest,
    @Body() dto: UpdateUserDto
  ) {
    const response = await this.service.update(id, dto);
    return SuccessResponse("Data Updated Successfully", response);
  }

}