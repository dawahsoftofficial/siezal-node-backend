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
  generateOtpMessage,
  generateRandomString,
  generateSessionId,
  hashBcrypt,
  hashString,
  normalizePakistaniPhone,
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
import { PhoneDto } from "./dto/phone-dto";
import { ChangePasswordDto } from "../user/dto/change-password.dto";
import { UserSessionService } from "../user-session/user-session.service";
import { FcmTokenService } from "../fcm-token/fcm-token.service";
import { LoginResult } from "src/common/interfaces/app.interface";
import { MetaWhatsappService } from "src/shared/meta-whatsapp/meta-whatsapp.service";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly userService: UserService,
    // private readonly firebaseService: FirebaseService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly aesHelper: AesHelper,
    private readonly metaWhatsappService: MetaWhatsappService,
    private readonly userSessionService: UserSessionService,
    private readonly fcmTokenService: FcmTokenService
  ) {}

  exists = async ({ phone }: PhoneDto) => {
    const existing = await this.userService.exists({ phone: phone });
    return existing;
  };
  signup = async (dto: SignupDto) => {
    const existing = await this.userService.findOne({
      where: { phone: dto.phone },
    });

    if (existing) {
      throw new ConflictException("Phone already in use");
    }

    const hashedPassword = await hashBcrypt(dto.password);

    const otp = generateOtp();
    const otpMessage = generateOtpMessage(otp);
    const phoneNumber = normalizePakistaniPhone(dto.phone);
    const sendOtp = await this.metaWhatsappService.sendWhatsappOtp(
      phoneNumber!,
      otpMessage
    );
    const expiresAt = addMinuteToNow(5); // OTP valid for 5 minutes

    if (!sendOtp) {
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
  ): Promise<LoginResult> => {
    this.logger.log(`Login attempt for identifier: ${identifier}`);

    // Here you would typically validate the user credentials and return a token
    const user = await this.userService.loginVerify(identifier, role);

    if (!user || !(await verifyPassword(password, user.password!))) {
      this.logger.warn(`Invalid login attempt for identifier: ${identifier}`);
      throw new UnauthorizedException("Invalid credentials");
    }

    if (user.isBanned) {
      throw new UnauthorizedException("User is banned!");
    }

    if (user.role === ERole.USER && !user.verifiedAt) {
      const otp = generateOtp();
      const otpMessage = generateOtpMessage(otp);
      const phoneNumber = normalizePakistaniPhone(identifier);
      const sendOtp = await this.metaWhatsappService.sendWhatsappOtp(
        phoneNumber!,
        otpMessage
      );
      const expiresAt = addMinuteToNow(5); // OTP valid for 5 minutes

      if (!sendOtp) {
        throw new HttpException(
          "Failed to send OTP",
          HttpStatus.SERVICE_UNAVAILABLE
        );
      }
      await this.userService.updateById(user.id!, {
        otp,
        otpExpiresAt: expiresAt,
      });
      return {
        type: "verification",
        verifiedAt: false,
      };
    }

    const {
      accessToken,
      encryptRefreshToken: refreshToken,
      sessionId,
      expiresAt,
    } = await this.generateUserJwtTokens(user);

    await Promise.all([
      this.redisService.setUserData(sessionId, {
        ...user,
        accessToken,
        refreshToken,
      }), // Store user data in Redis with TTL
      await this.userSessionService.create({
        sessionId,
        userId: user.id!,
        expiresAt,
        refreshToken,
      }),
    ]);

    const decoded = this.jwtService.decodeToken(accessToken);

    const userData = removeSensitiveData(user) as IUser;
    return {
      type: "success",
      ...userData,
      token: {
        accessToken,
        refreshToken,
        expiry: decoded?.exp! * 1000,
      },
    };
  };

  adminLogin = async (identifier: string, password: string) => {
    const user = await this.userService.loginVerify(identifier, ERole.ADMIN);

    if (!user || !(await verifyPassword(password, user.password!))) {
      this.logger.warn(`Invalid login attempt for identifier: ${identifier}`);
      throw new UnauthorizedException("Invalid credentials");
    }
    const {
      accessToken,
      encryptRefreshToken: refreshToken,
      sessionId,
      expiresAt,
    } = await this.generateUserJwtTokens(user);

    await Promise.all([
      this.redisService.setUserData(sessionId, {
        ...user,
        accessToken,
        refreshToken,
      }), // Store user data in Redis with TTL
      await this.userSessionService.create({
        sessionId,
        userId: user.id!,
        expiresAt,
        refreshToken,
      }),
    ]);

    const decoded = this.jwtService.decodeToken(accessToken);

    const userData = removeSensitiveData(user) as IUser;
    return {
      ...userData,
      token: {
        accessToken,
        refreshToken,
        expiry: decoded?.exp! * 1000,
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

    if (user.isBanned) {
      throw new UnauthorizedException("User is banned!");
    }

    const otp = generateOtp();
    const otpMessage = generateOtpMessage(otp);
    const phoneNumber = normalizePakistaniPhone(dto.phone);
    const sendOtp = await this.metaWhatsappService.sendWhatsappOtp(
      phoneNumber!,
      otpMessage
    );
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

    if (user.isBanned) {
      throw new UnauthorizedException("User is banned!");
    }

    const otp = generateOtp();
    const otpMessage = generateOtpMessage(otp);
    const phoneNumber = normalizePakistaniPhone(dto.phone);
    const sendOtp = await this.metaWhatsappService.sendWhatsappOtp(
      phoneNumber!,
      otpMessage
    );
    const expiresAt = addMinuteToNow(5);

    if (!sendOtp) {
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
      message: "Otp Send",
      expiresAt,
    };
  };

  verifyOtp = async (dto: VerifyOtpDto): Promise<TVerifyOtpResponse> => {
    const { phone, otp, forgotPassword } = dto;

    const user = await this.userService.findOne({ where: { phone } });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (user.isBanned) {
      throw new UnauthorizedException("User is banned!");
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
        3600000
      ); // Store reset token in Redis for 1 hour
      response = {
        token: { resetPasswordToken: randomString },
      };
    } else {
      const {
        accessToken,
        encryptRefreshToken: refreshToken,
        sessionId,
        expiresAt,
      } = await this.generateUserJwtTokens(user);
      await Promise.all([
        this.redisService.setUserData(sessionId, {
          ...user,
          accessToken,
          refreshToken,
        }),
        this.userSessionService.create({
          sessionId,
          userId: user.id!,
          expiresAt,
          refreshToken,
        }),
      ]);
      const userData = removeSensitiveData(user) as IUser;
      response = {
        ...userData,
        token: {
          accessToken,
          refreshToken,
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

    if (user.isBanned) {
      throw new UnauthorizedException("User is banned!");
    }

    const hashedPassword = await hashBcrypt(newPassword);

    await this.userService.updateById(user.id!, {
      password: hashedPassword,
    });
  };

  accessToken = async (
    encryptRefreshToken: string
  ): Promise<{ accessToken: string; refreshToken?: string }> => {
    this.logger.log("access token route running Decrypting refresh token");
    const decryptedRefreshToken =
      this.aesHelper.decryptData(encryptRefreshToken);
    const result = await this.jwtService.verifyRefreshToken(
      decryptedRefreshToken
    );
    if (!result) {
      throw new UnauthorizedException("Invalid Token");
    }
    const { id: userId, role, sessionId } = result;
    let userUpdatedData = await this.redisService.getUserData(
      sessionId,
      role,
      userId!
    );
    const cacheRefreshToken = userUpdatedData?.refreshToken;

    if (!userUpdatedData || cacheRefreshToken !== encryptRefreshToken) {
      const sessionData =
        await this.userSessionService.findBySessionIdAndRefreshToken(
          sessionId,
          encryptRefreshToken
        );
      if (!sessionData) {
        throw new UnauthorizedException("Token Not found");
      }
      userUpdatedData = sessionData?.user;
    }

    if (!userUpdatedData) {
      throw new UnauthorizedException("User Data Not found");
    }

    if (userUpdatedData.isBanned) {
      throw new UnauthorizedException("User is banned!");
    }

    const accessToken = this.jwtService.generateAccessToken(
      sessionId,
      userUpdatedData
    );
    const decoded = this.jwtService.decodeToken(accessToken);

    const response: {
      accessToken: string;
      refreshToken?: string;
      expiry: number;
    } = {
      accessToken: accessToken,
      expiry: decoded?.exp! * 1000,
    };

    await this.redisService.setUserData(sessionId, {
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

    if (user.isBanned) {
      throw new UnauthorizedException("User is banned!");
    }

    return removeSensitiveData(user);
  };

  update = async (userId: number, payload: Partial<IUser>): Promise<void> => {
    const user = await this.userService.updateById(userId, {
      ...payload,
    });
    if (!user) {
      throw new NotFoundException("User not found");
    }
  };

  changePassword = async (
    userId: number,
    { currentPassword, newPassword }: ChangePasswordDto
  ) => {
    const user = await this.userService.findById(userId);
    const verifyOldPassword = user
      ? await verifyPassword(currentPassword, user.password!)
      : false;
    if (!verifyOldPassword) {
      throw new UnprocessableEntityException({
        message: "Validation failed",
        errors: {
          currentPassword: ["does not match our records"],
        },
        statusCode: 422,
      });
    }
    const hashP = await hashBcrypt(newPassword);
    await this.userService.updateById(userId, {
      password: hashP,
    });
  };

  logout = async (
    sessionId: string,
    role: ERole,
    userId: number
  ): Promise<void> => {
    const user = await this.userSessionService.deleteSession(sessionId, userId);
    if (!user) {
      throw new NotFoundException("User Session not found");
    }
    await Promise.all([
      this.fcmTokenService.deleteToken(sessionId),
      this.redisService.deleteUserData(sessionId, role!, userId),
    ]);
  };

  private generateUserJwtTokens = async (
    user: IUser
  ): Promise<{
    accessToken: string;
    encryptRefreshToken: string;
    sessionId: string;
    expiresAt: Date;
  }> => {
    // ✅ Generate Tokens
    const sessionId = generateSessionId();
    const accessToken = this.jwtService.generateAccessToken(sessionId, user);
    const { token: refreshToken, expiresAt } =
      this.jwtService.generateRefreshToken(sessionId, user);

    const encryptRefreshToken = this.aesHelper.encryptData(refreshToken);

    return { accessToken, encryptRefreshToken, sessionId, expiresAt };
  };
}
