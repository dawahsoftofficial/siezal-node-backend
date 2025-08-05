import { Body, HttpCode, HttpStatus, Post, UseGuards } from "@nestjs/common";
import { ApiExtraModels, ApiTags, getSchemaPath } from "@nestjs/swagger";
import { AuthService } from "../auth.service";
import { SignupDto } from "../dto/signup.dto";
import { ForgotPasswordDto } from "../dto/forget-password.dto";
import { VerifyOtpDto } from "../dto/verify-otp.dto";
import { ResetPasswordDto } from "../dto/reset-password.dto";
import { PublicAuthGuard } from "src/common/guards/public-auth.guard";
import {
  UserRouteController,
  AuthUser,
} from "src/common/decorators/app.decorator";
import { SuccessResponse } from "src/common/utils/api-response.util";
import {
  SuccessResponseNoDataDto,
  SuccessResponseResetTokenDto,
  SuccessResponseSingleObjectDto,
  SuccessResponseSingleObjectWithTokenDto,
  SuccessResponseTokenDto,
} from "src/common/dto/app.dto";
import { GenerateSwaggerDoc } from "src/common/decorators/swagger-generate.decorator";
import { AccessTokenDto } from "../dto/access-token.dto";
import { IAuthRequest } from "src/common/interfaces/app.interface";
import { LoginUserDto } from "../dto/login-user.dto";
import { ResendOtpDto } from "../dto/resend-otp.dto";

@ApiTags("User Authentication")
@UserRouteController("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @GenerateSwaggerDoc({
    summary: "Register new user",
    security: [{ key: "apiKey", name: "payload" }],
    responses: [
      { status: HttpStatus.CREATED },
      { status: HttpStatus.BAD_REQUEST },
      { status: HttpStatus.UNPROCESSABLE_ENTITY },
      { status: HttpStatus.CONFLICT },
      { status: HttpStatus.INTERNAL_SERVER_ERROR },
    ],
  })
  @Post("signup")
  @UseGuards(PublicAuthGuard)

  async signup(@Body() dto: SignupDto) {
    await this.authService.signup(dto);
    return SuccessResponse("Signup successful, OTP sent to phone");
  }

  @GenerateSwaggerDoc({
    summary: "Login user",
    security: [{ key: "apiKey", name: "payload" }],
    responses: [
      { status: HttpStatus.OK, type: SuccessResponseSingleObjectWithTokenDto },
      { status: HttpStatus.NOT_FOUND },
      { status: HttpStatus.UNAUTHORIZED },
      { status: HttpStatus.UNPROCESSABLE_ENTITY },
      { status: HttpStatus.INTERNAL_SERVER_ERROR },
    ],
  })
  @HttpCode(HttpStatus.OK)
  @UseGuards(PublicAuthGuard)
  @Post("login")
  async login(@Body() dto: LoginUserDto) {
    const { token, ...user } = await this.authService.login(
      dto.phone,
      dto.password
    );
    return SuccessResponse("Login successful", user, token);
  }

  @GenerateSwaggerDoc({
    summary: "Resend OTP for password reset",
    security: [{ key: "apiKey", name: "payload" }],
    responses: [
      { status: HttpStatus.OK },
      { status: HttpStatus.UNPROCESSABLE_ENTITY },
      { status: HttpStatus.NOT_FOUND },
      { status: HttpStatus.INTERNAL_SERVER_ERROR },
      { status: HttpStatus.BAD_REQUEST },
    ],
  })
  @UseGuards(PublicAuthGuard)
  @Post('resend-otp')
  @HttpCode(HttpStatus.OK)
  async resendOtp(@Body() dto: ResendOtpDto) {
    await this.authService.resendOtp(dto);
    return SuccessResponse("OTP resent to your phone");
  }

  @GenerateSwaggerDoc({
    summary: "Send OTP for password reset",
    security: [{ key: "apiKey", name: "payload" }],
    responses: [
      { status: HttpStatus.OK },
      { status: HttpStatus.UNPROCESSABLE_ENTITY },
      { status: HttpStatus.NOT_FOUND },
      { status: HttpStatus.INTERNAL_SERVER_ERROR },
      { status: HttpStatus.BAD_REQUEST },
    ],
  })
  @UseGuards(PublicAuthGuard)
  @Post("forgot-password")
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.authService.forgetPassword(dto);
    return SuccessResponse("OTP sent to your phone");
  }

  @ApiExtraModels(SuccessResponseResetTokenDto)
  @GenerateSwaggerDoc({
    summary: "Verify phone OTP",
    security: [{ key: "apiKey", name: "payload" }],
    responses: [
      {
        status: HttpStatus.OK,
        schema: {
          oneOf: [
            { $ref: getSchemaPath(SuccessResponseSingleObjectWithTokenDto) },
            { $ref: getSchemaPath(SuccessResponseResetTokenDto) },
          ],
          discriminator: {
            propertyName: "flow",
            mapping: {
              login: getSchemaPath(SuccessResponseSingleObjectWithTokenDto),
              forgotPassword: getSchemaPath(SuccessResponseResetTokenDto),
            },
          },
        },
        description:
          "Returns either user with token OR reset token depending on flow",
      },

      { status: HttpStatus.NOT_FOUND },
      { status: HttpStatus.UNAUTHORIZED },
      { status: HttpStatus.UNPROCESSABLE_ENTITY },
      { status: HttpStatus.INTERNAL_SERVER_ERROR },
      { status: HttpStatus.BAD_REQUEST },
    ],
  })
  @HttpCode(HttpStatus.OK)
  @UseGuards(PublicAuthGuard)
  @Post("verify-otp")
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    const { token, ...user } = await this.authService.verifyOtp(dto);
    return SuccessResponse("OTP verified successfully", user, token);
  }

  @GenerateSwaggerDoc({
    summary: "Reset password using OTP",
    security: [{ key: "apiKey", name: "resetpassword" }],
    responses: [
      { status: HttpStatus.OK },
      { status: HttpStatus.BAD_REQUEST },
      { status: HttpStatus.UNPROCESSABLE_ENTITY },
      { status: HttpStatus.NOT_FOUND },
      { status: HttpStatus.INTERNAL_SERVER_ERROR },
    ],
  })
  @HttpCode(HttpStatus.OK)
  @UseGuards(PublicAuthGuard)
  @Post("reset-password")
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.authService.resetPassword(dto);
    return SuccessResponse("Password reset successful");
  }

  @GenerateSwaggerDoc({
    summary: 'Get updated access token on expiration',
    security: [{ key: 'apiKey', name: 'payload' }],
    responses: [
      { status: HttpStatus.OK, type: SuccessResponseTokenDto },
      { status: HttpStatus.BAD_REQUEST },
      { status: HttpStatus.UNPROCESSABLE_ENTITY },
      { status: HttpStatus.INTERNAL_SERVER_ERROR },
    ],
  })
  @HttpCode(200)
  @UseGuards(PublicAuthGuard)
  @Post('access-token')
  async accessToken(
    @Body() { refreshToken }: AccessTokenDto,
  ) {
    const response = await this.authService.accessToken(refreshToken);
    return SuccessResponse("Token reset successful", {}, response);
  }

  @GenerateSwaggerDoc({
    summary: 'Get my details',
    responses: [
      { status: HttpStatus.OK, type: SuccessResponseSingleObjectDto },
      { status: HttpStatus.BAD_REQUEST },
      { status: HttpStatus.UNPROCESSABLE_ENTITY },
      { status: HttpStatus.INTERNAL_SERVER_ERROR },
    ],
  })
  @HttpCode(200)
  @Post('my-profile')
  async myProfile(
    @AuthUser() { id }: IAuthRequest
  ) {
    const response = await this.authService.getProfile(id);
    return SuccessResponse("Data Fetched Succesfully!", response);
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
    await this.authService.logout(role, id);
    return SuccessResponse("Logged out successfully");
  }
}
