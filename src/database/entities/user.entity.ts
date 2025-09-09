import { ERole } from "src/common/enums/role.enum";
import { BaseEntity } from "src/core/base/entity/entity.base";
import { IUser } from "src/module/user/interface/user.interface";
import { Entity, Column, OneToMany, DeleteDateColumn } from "typeorm";
import { UserSession } from "./user-session.entity";
import { IUserSession } from "src/module/user-session/interface/user-session.interface";
import { IFcmToken } from "src/module/fcm-token/interface/fcm-token.interface";
import { FcmToken } from "./fcm-token.entity";

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

  @Column({ name: "shipping_address_line_1", type: "varchar", length: 255, nullable: true })
  shippingAddressLine1?: string | null;

  @Column({ name: "shipping_address_line_2", type: "varchar", length: 255, nullable: true })
  shippingAddressLine2?: string | null;

  @Column({ name: "shipping_postal_code", type: "varchar", length: 20, nullable: true })
  shippingPostalCode?: string | null;

  @Column({ name: "shipping_city", type: "varchar", length: 100, nullable: true })
  shippingCity?: string | null;

  @Column({ name: "shipping_country", type: "varchar", length: 100, nullable: true })
  shippingCountry?: string | null;

  @Column({ name: "shipping_state", type: "varchar", length: 100, nullable: true })
  shippingState?: string | null;
}
