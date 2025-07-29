import { ERole } from 'src/common/enums/role.enum';
import { BaseEntity } from 'src/core/base/entity/entity.base';
import { IUser } from 'src/module/user/interface/user.interface';
import { Entity, Column } from 'typeorm';

@Entity({ name: 'users' })
export class User extends BaseEntity implements IUser {
  @Column({ name: 'first_name', length: 100, nullable: true })
  firstName: string;

  @Column({ name: 'last_name', length: 100, nullable: true })
  lastName: string;

  @Column({ nullable: true })
  email: string;

  @Column({ unique: true })
  phone: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: ERole,
    default: ERole.USER,
  })
  role: ERole;

  @Column({ name: 'verified_at', nullable: true, type: 'timestamp' })
  verifiedAt?: Date;

  @Column({ name: 'refresh_token', nullable: true, type: 'text' })
  refreshToken?: string;

  @Column({ name: 'google_id', nullable: true })
  googleId?: string;

  @Column({ nullable: true })
  otp?: string;

  @Column({ name: 'otp_expires_at', nullable: true, type: 'timestamp' })
  otpExpiresAt?: Date;
}
