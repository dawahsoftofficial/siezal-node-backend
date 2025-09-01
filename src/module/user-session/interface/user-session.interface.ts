import { IUser } from "src/module/user/interface/user.interface";

export interface IUserSession {
  sessionId: string;
  userId: number;
  user?: IUser;
  refreshToken: string;

  expiresAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
