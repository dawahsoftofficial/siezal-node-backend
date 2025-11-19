import { ERole } from "src/common/enums/role.enum";
import { BaseEntity } from "src/core/base/entity/entity.base";
import { IUser } from "src/module/user/interface/user.interface";
import { Entity, Column, OneToMany, DeleteDateColumn } from "typeorm";
import { UserSession } from "./user-session.entity";
import { IUserSession } from "src/module/user-session/interface/user-session.interface";
import { IFcmToken } from "src/module/fcm-token/interface/fcm-token.interface";
import { FcmToken } from "./fcm-token.entity";
import { Address } from "./address.entity";
import { PendingOrder } from "./pending-order.entity";
import { IPendingOrder } from "src/module/pending-order/interface/pending-order.interface";

@Entity({ name: "users" })
export class User extends BaseEntity implements IUser {
  @Column({ name: "first_name", length: 100, nullable: true })
  firstName: string;

  @Column({ name: "last_name", length: 100, nullable: true })
  lastName: string;

  @Column({ type: "varchar", nullable: true })
  email: string | null;

  @Column({ unique: true })
  phone: string;

  @Column()
  password: string;

  @Column({ name: "is_banned", type: "boolean", default: false })
  isBanned: boolean;

  @Column({
    type: "enum",
    enum: ERole,
    default: ERole.USER,
  })
  role: ERole;

  @Column({ name: "verified_at", nullable: true, type: "timestamp" })
  verifiedAt?: Date;

  @Column({ name: "google_id", nullable: true })
  googleId?: string;

  @Column({ nullable: true, type: "varchar" })
  otp?: string | null;

  @Column({ name: "otp_expires_at", nullable: true, type: "timestamp" })
  otpExpiresAt?: Date | null;

  @OneToMany(() => UserSession, (data) => data.user, {
    cascade: true,
  })
  sessions?: Partial<IUserSession[]> | null;

  @OneToMany(() => FcmToken, (data) => data.user, {
    cascade: true,
  })
  fcmTokens?: Partial<IFcmToken[]> | null;

  @DeleteDateColumn({ name: "deleted_at", type: "timestamp", nullable: true })
  deletedAt?: Date | null;

  @OneToMany(() => Address, (address) => address.user, { cascade: true })
  addresses: Address[];

  @OneToMany(() => PendingOrder, (data) => data.user, {
    cascade: true,
  })
  pendingOrders?: Partial<IPendingOrder[]> | null;
}
