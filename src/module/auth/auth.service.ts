import {
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from "@nestjs/common";
import { UserService } from "../user/user.service";
import { ERole } from "src/common/enums/role.enum";
import {
  generateOtp,
  generateRandomString,
  hashBcrypt,
  hashString,
  removeSensitiveData,
  verifyPassword,
} from "src/common/utils/app.util";
import { JwtService } from "src/shared/jwt/jwt.service";
import { AesHelper } from "src/common/helpers/aes.helper";
import { IUser } from "../user/interface/user.interface";
import { RedisService } from "src/shared/redis/redis.service";
import { SignupDto } from "./dto/signup.dto";
import { VerifyOtpDto } from "./dto/verify-otp.dto";
import { ForgotPasswordDto } from "./dto/forget-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { TVerifyOtpResponse } from "./interface/response.interface";
import { addMinuteToNow, isNotAfterNow } from "src/common/utils/date.util";
// import { FirebaseService } from "src/shared/firebase/firebase.service";
import { ResendOtpDto } from "./dto/resend-otp.dto";
import { UpdateUserDto } from "../user/dto/update-user.dto";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly userService: UserService,
    // private readonly firebaseService: FirebaseService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly aesHelper: AesHelper
  ) {}

  signup = async (dto: SignupDto) => {
    const existing = await this.userService.findOne({
      where: { phone: dto.phone },
    });

    if (existing) {
      throw new ConflictException("Phone already in use");
    }

    const hashedPassword = await hashBcrypt(dto.password);
    const otp = generateOtp();
    const expiresAt = addMinuteToNow(5); // OTP valid for 5 minutes

    const sent = true; // await sendOtp(dto.phone, otp);
    if (!sent) {
      throw new HttpException(
        "Failed to send OTP",
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }

    const user = await this.userService.create({
      ...dto,
      password: hashedPassword,
      role: ERole.USER,
      otp,
      otpExpiresAt: expiresAt,
    });

    const userData = removeSensitiveData(user);

    return { message: otp, userData };
  };

  login = async (
    identifier: string,
    password: string,
    role: ERole = ERole.USER
  ): Promise<
    IUser & {
      token: {
        accessToken: string;
        refreshToken: string;
      };
    }
  > => {
    this.logger.log(`Login attempt for identifier: ${identifier}`);

    // Here you would typically validate the user credentials and return a token
    const user = await this.userService.loginVerify(identifier, role);

    if (!user || !(await verifyPassword(password, user.password!))) {
      this.logger.warn(`Invalid login attempt for identifier: ${identifier}`);
      throw new UnauthorizedException("Invalid credentials");
    }

    const { accessToken, encryptRefreshToken } =
      await this.generateUserJwtTokens(user);

    const refreshToken = encryptRefreshToken;
    await Promise.all([
      this.redisService.setUserData({ ...user, accessToken }), // Store user data in Redis with TTL
      await this.userService.updateById(user.id!, {
        refreshToken,
      }),
    ]);
    const userData = removeSensitiveData(user) as IUser;
    return {
      ...userData,
      token: {
        accessToken,
        refreshToken,
      },
    };
  };

  forgetPassword = async (dto: ForgotPasswordDto) => {
    const user = await this.userService.findOne({
      where: { phone: dto.phone },
    });

    if (!user) {
      throw new HttpException("User not found", HttpStatus.NOT_FOUND);
    }

    const otp = "123456"; // generateOtp();
    const expiresAt = addMinuteToNow(5); // OTP valid for 5 minutes

    const sent = true; // await this.firebaseService.sendOtp(dto.phone, otp);

    if (!sent) {
      throw new HttpException(
        "Failed to send OTP",
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }

    await this.userService.updateById(user.id!, {
      otp: otp,
      otpExpiresAt: expiresAt,
    });

    return {
      message: "OTP sent successfully",
      expiresAt,
    };
  };

  resendOtp = async (dto: ResendOtpDto) => {
    const user = await this.userService.findOne({
      where: { phone: dto.phone },
    });

    if (!user) {
      throw new HttpException("User not found", HttpStatus.NOT_FOUND);
    }

    const otp = "123456"; // generateOtp();
    const expiresAt = addMinuteToNow(5);

    const sent = true; // await this.firebaseService.sendOtp(dto.phone, otp);

    if (!sent) {
      throw new HttpException(
        "Failed to send OTP",
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }

    await this.userService.updateById(user.id!, {
      otp: otp,
      otpExpiresAt: expiresAt,
    });

    return {
      message: otp,
      expiresAt,
    };
  };

  verifyOtp = async (dto: VerifyOtpDto): Promise<TVerifyOtpResponse> => {
    const { phone, otp, forgotPassword } = dto;

    const user = await this.userService.findOne({ where: { phone } });

    if (!user) {
      throw new NotFoundException("User not found");
    }
    if (!user.otp || !user.otpExpiresAt) {
      throw new NotFoundException("OTP not found");
    }
    const isExpired = isNotAfterNow(user.otpExpiresAt);
    const isValid = user.otp === otp;

    if (!isValid || isExpired) {
      throw new UnauthorizedException("Invalid or expired OTP");
    }
    const dataToUpdate: Partial<IUser> = {
      otp: null,
      otpExpiresAt: null,
      verifiedAt: new Date(),
    };

    let response: TVerifyOtpResponse = {};
    if (forgotPassword) {
      const randomString = generateRandomString(48);
      const resetPasswordToken = hashString(randomString);
      await this.redisService.setResetPaswordToken(
        resetPasswordToken,
        user.id!,
        3600
      ); // Store reset token in Redis for 1 hour
      response = {
        token: { resetPasswordToken: randomString },
      };
    } else {
      const { accessToken, encryptRefreshToken } =
        await this.generateUserJwtTokens(user);
      await this.redisService.setUserData({ ...user, accessToken });
      dataToUpdate.refreshToken = encryptRefreshToken;
      const userData = removeSensitiveData(user) as IUser;
      response = {
        ...userData,
        token: {
          accessToken,
          refreshToken: encryptRefreshToken,
        },
      };
    }

    await this.userService.updateById(user.id!, dataToUpdate);

    return response;
  };

  resetPassword = async (dto: ResetPasswordDto) => {
    const { resetPasswordToken, newPassword } = dto;

    const hashedToken = hashString(resetPasswordToken);
    const userId =
      await this.redisService.getUserIdResetPasswordToken(hashedToken);
    if (!userId) {
      throw new ForbiddenException("Invalid or expired reset password token");
    }
    const user = await this.userService.findById(userId);

    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (user.otp || user.otpExpiresAt) {
      throw new ForbiddenException(
        "OTP verification required before resetting password"
      );
    }

    const hashedPassword = await hashBcrypt(newPassword);

    await this.userService.updateById(user.id!, {
      password: hashedPassword,
    });
  };

  accessToken = async (
    encryptRefreshToken: string
  ): Promise<{ accessToken: string; refreshToken?: string }> => {
    const decryptedRefreshToken =
      this.aesHelper.decryptData(encryptRefreshToken);
    const result = await this.jwtService.verifyRefreshToken(
      decryptedRefreshToken
    );
    if (!result) {
      throw new UnauthorizedException("Invalid Token");
    }
    const { id: userId, role } = result;
    let userUpdatedData = await this.redisService.getUserData(role, userId!);
    const cacheRefreshToken = userUpdatedData?.refreshToken;

    if (!userUpdatedData || cacheRefreshToken !== encryptRefreshToken) {
      userUpdatedData =
        await this.userService.findByRefreshToken(encryptRefreshToken);
    }

    if (!userUpdatedData) {
      throw new UnauthorizedException("Token Not found");
    }
    const accessToken = this.jwtService.generateAccessToken(userUpdatedData);
    const response: { accessToken: string; refreshToken?: string } = {
      accessToken: accessToken,
    };
    await this.redisService.setUserData({
      ...userUpdatedData,
      refreshToken: encryptRefreshToken,
      accessToken,
    });

    return response;
  };

  getProfile = async (userId: number): Promise<IUser> => {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return removeSensitiveData(user);
  };

  update = async (userId: number, payload: UpdateUserDto): Promise<void> => {
    const user = await this.userService.updateById(userId, {
      ...payload,
    });
    if (!user) {
      throw new NotFoundException("User not found");
    }
  };

  logout = async (role: ERole, userId: number): Promise<void> => {
    const user = await this.userService.updateById(userId, {
      refreshToken: null,
    });
    if (!user) {
      throw new NotFoundException("User not found");
    }
    // Clear user data from Redis
    await this.redisService.deleteUserData(role!, userId);
  };

  private generateUserJwtTokens = async (
    user: IUser
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
