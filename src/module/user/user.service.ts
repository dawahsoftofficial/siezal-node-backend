import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseSqlService } from 'src/core/base/services/sql.base.service';
import { Repository } from 'typeorm';
import { IUser } from './interface/user.interface';
import { User } from 'src/database/entities/user.entity';
import { ERole } from 'src/common/enums/role.enum';
import { instanceToPlain } from 'class-transformer';


@Injectable()
export class UserService extends BaseSqlService<User, IUser> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super(userRepository);
  }

  async findByEmail(email: string,role= ERole.USER): Promise<IUser | null> {
    return instanceToPlain(await this.findOne({ where: { email ,role} })) as IUser | null;
  }
  

}
