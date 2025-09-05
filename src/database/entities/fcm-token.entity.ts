import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "src/core/base/entity/entity.base";
import { User } from "./user.entity";
import { IFcmToken } from "src/module/fcm-token/interface/fcm-token.interface";
import { EDeviceType } from "src/common/enums/device-type.enum";
import { UserSession } from "./user-session.entity";
import { IUserSession } from "src/module/user-session/interface/user-session.interface";

@Entity({ name: "fcm_tokens" })
export class FcmToken extends BaseEntity implements IFcmToken {
  @Column({ name: "user_id", type: "int" })
  userId: number;

  @Column({
    name: "user_session_id",

    type: "uuid",
  })
  userSessionId: string;

  @ManyToOne(() => UserSession, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_session_id", referencedColumnName: "sessionId" })
  userSession: IUserSession;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column({ name: "token", type: "text" })
  token: string;

  @Column({
    name: "device_type",
    type: "enum",
    enum: EDeviceType,
  })
  deviceType: EDeviceType;
}
