import {
    Body,
    HttpCode,
    HttpStatus,
    Post,
    UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from '../auth.service';
import { SignupDto } from '../dto/signup.dto';
import { LoginDto } from '../dto/login.dto';
import { ForgotPasswordDto } from '../dto/forget-password.dto';
import { VerifyOtpDto } from '../dto/verify-otp.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { PublicAuthGuard } from 'src/common/guards/public-auth.guard';
import { UserRouteController, ApplyHeader } from 'src/common/decorators/app.decorator';
import { PublicRouteHeaderDto } from 'src/common/dto/public-route-header.dto';
import { SuccessResponse } from 'src/common/utils/api-response.util';
import { SuccessResponseSingleObjectWithTokenDto } from "src/common/dto/app.dto";
import { GenerateSwaggerDoc } from 'src/common/decorators/swagger-generate.decorator';

@ApiTags('User Authentication')
@UserRouteController('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @GenerateSwaggerDoc({
        summary: 'Register new user',
        responses: [
            { status: HttpStatus.CREATED },
            { status: HttpStatus.BAD_REQUEST },
        ],
    })
    @Post('signup')
    async signup(@Body() dto: SignupDto) {
        await this.authService.signup(dto);
        return SuccessResponse('Signup successful, OTP sent to phone');
    }

    @GenerateSwaggerDoc({
        summary: 'Login user',
        responses: [
            { status: HttpStatus.OK, type: SuccessResponseSingleObjectWithTokenDto },
            { status: HttpStatus.UNAUTHORIZED },
        ],
    })
    @HttpCode(HttpStatus.OK)
    @UseGuards(PublicAuthGuard)
    @ApplyHeader(PublicRouteHeaderDto)
    @Post('login')
    async login(@Body() dto: LoginDto) {
        const { token, ...user } = await this.authService.login(dto.email, dto.password);
        return SuccessResponse('Login successful', user, token);
    }

    @GenerateSwaggerDoc({
        summary: 'Send OTP for password reset',
        responses: [
            { status: HttpStatus.OK },
            { status: HttpStatus.BAD_REQUEST },
        ],
    })
    @Post('forgot-password')
    async forgotPassword(@Body() dto: ForgotPasswordDto) {
        await this.authService.forgetPassword(dto);
        return SuccessResponse('OTP sent to your phone');
    }

    @GenerateSwaggerDoc({
        summary: 'Verify phone OTP',
        responses: [
            { status: HttpStatus.OK },
            { status: HttpStatus.BAD_REQUEST },
        ],
    })
    @Post('verify-otp')
    async verifyOtp(@Body() dto: VerifyOtpDto) {
        await this.authService.verifyOtp(dto);
        return SuccessResponse('OTP verified successfully');
    }

    @GenerateSwaggerDoc({
        summary: 'Reset password using OTP',
        responses: [
            { status: HttpStatus.OK },
            { status: HttpStatus.BAD_REQUEST },
        ],
    })
    @Post('reset-password')
    async resetPassword(@Body() dto: ResetPasswordDto) {
        await this.authService.resetPassword(dto);
        return SuccessResponse('Password reset successful');
    }
}
  