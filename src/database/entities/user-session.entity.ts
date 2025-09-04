import { IUserSession } from "src/module/user-session/interface/user-session.interface";
import { IUser } from "src/module/user/interface/user.interface";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./user.entity";
import { FcmToken } from "./fcm-token.entity";

@Entity("user_sessions")
export class UserSession implements IUserSession {
  @PrimaryGeneratedColumn("uuid", { name: "session_id" })
  sessionId: string;

  @CreateDateColumn({
    name: "created_at",
    type: "datetime",
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: "updated_at",
    type: "datetime",
  })
  updatedAt: Date;

  @Column({ name: "user_id", type: "int" })
  userId: number;

  @ManyToOne(() => User, (user) => user.sessions, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: IUser;

  @Column({ type: "text", name: "refresh_token" })
  refreshToken: string;

  @Column({ type: "datetime", name: "expires_at" })
  expiresAt: Date;

  @OneToOne(() => FcmToken, (data) => data.userSession, {
    cascade: true,
  })
  fcmToken?: Partial<FcmToken> | null;
}
