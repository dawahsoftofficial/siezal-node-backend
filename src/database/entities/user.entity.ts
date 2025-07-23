import { ERole } from 'src/common/enums/role.enum';
import { BaseEntity } from 'src/core/base/entity/entity.base';
import { IUser } from 'src/module/user/interface/user.interface';
import { Entity, Column} from 'typeorm';

@Entity({ name: 'users' })
export class User extends BaseEntity implements IUser{


  @Column({ name:'first_name', length: 100,nullable: true })
  firstName: string;
    @Column({ name:'last_name' ,length: 100,nullable: true })
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

    @Column({
    type: 'enum',
    enum: ERole,
    default: ERole.USER, // Default role can be set to USER or any other role as per your requirement
  })
  role: ERole;


  @Column({ name: 'refresh_token', nullable: true })
  refreshToken?: string; // Optional, used for JWT

}
