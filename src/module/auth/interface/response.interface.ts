import { IUser } from "src/module/user/interface/user.interface";


export type TVerifyOtpResponse = Partial<IUser> & {
  token?: { accessToken?: string; refreshToken?: string; resetPasswordToken?: string };
};