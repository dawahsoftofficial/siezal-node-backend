import { HttpException, HttpStatus, Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { UserService } from "../user/user.service";
import { ERole } from "src/common/enums/role.enum";
import { generateOtp, hashBcrypt, removeSensitiveData, verifyPassword } from "src/common/utils/app.util";
import { JwtService } from "src/shared/jwt/jwt.service";
import { AesHelper } from "src/common/helpers/aes.helper";
import { IUser } from "../user/interface/user.interface";
import { RedisService } from "src/shared/redis/redis.service";
import { SignupDto } from "./dto/signup.dto";
import { VerifyOtpDto } from "./dto/verify-otp.dto";
import { ForgotPasswordDto } from "./dto/forget-password.dto";
import moment from "moment";
import { ResetPasswordDto } from "./dto/reset-password.dto";


@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly aesHelper: AesHelper,
  ) { }

  signup = async (dto: SignupDto) => {
    const existing = await this.userService.findOne({ where: { phone: dto.phone } });

    if (existing) {
      throw new HttpException('Phone already in use', HttpStatus.CONFLICT);
    }

    const hashedPassword = await hashBcrypt(dto.password);

    const user = await this.userService.create({
      ...dto,
      password: hashedPassword,
      role: ERole.USER,
    });

    const userData = removeSensitiveData(user);

    return { message: 'User created successfully', userData };
  }

  login = async (
    email: string,
    password: string
  ): Promise<IUser & {
    token: {
      accessToken: string;
      refreshToken: string;
    };
  }> => {
    this.logger.log(`Login attempt for email: ${email}`);
    // Here you would typically validate the user credentials and return a token
    const user = await this.userService.findByEmail(email, ERole.ADMIN);

    if (!user || !(await verifyPassword(password, user.password!))) {
      this.logger.warn(`Invalid login attempt for email: ${email}`);
      throw new UnauthorizedException('Invalid credentials');
    }
    this.logger.log(`User logged in successfully: ${user.email}`);
    const { accessToken, encryptRefreshToken } =
      await this.generateUserJwtTokens(user);

    const refreshToken = encryptRefreshToken
    await Promise.all([
      this.redisService.setUserData({ ...user, accessToken }), // Store user data in Redis with TTL
      await this.userService.updateById(user.id!, {
        refreshToken
      })
    ]);
    const userData = removeSensitiveData(user) as IUser;
    return {
      ...userData, token: {
        accessToken,
        refreshToken
      }
    };
  }

  forgetPassword = async (dto: ForgotPasswordDto) => {
    const user = await this.userService.findOne({ where: { phone: dto.phone } });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const otp = generateOtp();
    const expiresAt = moment().add(5, 'minutes').toDate(); // OTP valid for 5 minutes

    const sent = true; // await sendOtp(dto.phone, otp);

    if (!sent) {
      throw new HttpException('Failed to send OTP', HttpStatus.SERVICE_UNAVAILABLE);
    }

    await this.userService.updateById(user.id!, { otp: otp, otpExpiresAt: expiresAt });

    return {
      message: 'OTP sent successfully',
      expiresAt,
    };
  };

  verifyOtp = async (dto: VerifyOtpDto) => {
    const { phone, otp } = dto;

    const user = await this.userService.findOne({ where: { phone } });

    if (!user || !user.otp || !user.otpExpiresAt) {
      throw new HttpException('OTP not found', HttpStatus.UNAUTHORIZED);
    }

    const isExpired = moment().isAfter(user.otpExpiresAt);
    const isValid = user.otp === otp;

    if (!isValid || isExpired) {
      throw new HttpException('Invalid or expired OTP', HttpStatus.UNAUTHORIZED);
    }

    await this.userService.updateById(user.id!, {
      otp: null,
      otpExpiresAt: null,
    });

    return { message: 'OTP verified' };
  };

  resetPassword = async (dto: ResetPasswordDto) => {
    const { phone, newPassword } = dto;

    const user = await this.userService.findOne({ where: { phone } });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    if (user.otp || user.otpExpiresAt) {
      throw new HttpException('OTP verification required before resetting password', HttpStatus.FORBIDDEN);
    }

    const hashedPassword = await hashBcrypt(newPassword);

    await this.userService.updateById(user.id!, {
      password: hashedPassword,
    });

    return { message: 'Password has been reset successfully' };
  };

  private generateUserJwtTokens = async (
    user: IUser,
  ): Promise<{
    accessToken: string;
    encryptRefreshToken: string;
  }> => {
    // ✅ Generate Tokens
    const accessToken = this.jwtService.generateAccessToken(user);
    const refreshToken = this.jwtService.generateRefreshToken(user);

    const encryptRefreshToken = this.aesHelper.encryptData(refreshToken);

    return { accessToken, encryptRefreshToken };
  };

}