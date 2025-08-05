import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseSqlService } from 'src/core/base/services/sql.base.service';
import { Repository } from 'typeorm';
import { IUser } from './interface/user.interface';
import { User } from 'src/database/entities/user.entity';
import { ERole } from 'src/common/enums/role.enum';
import { instanceToPlain } from 'class-transformer';
import { UpdateUserDto } from './dto/update-user.dto';
import { hashBcrypt } from 'src/common/utils/app.util';


@Injectable()
export class UserService extends BaseSqlService<User, IUser> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super(userRepository);
  }

  async loginVerify(identifier: string, role = ERole.USER): Promise<IUser | null> {
    const filter = role === ERole.ADMIN ? { email: identifier } : { phone: identifier };
    return instanceToPlain(await this.findOne({ where: { ...filter, role } })) as IUser | null;
  }

  findByRefreshToken = async (refreshToken: string) => {
    return await this.userRepository.findOne({
      where: { refreshToken },

    }) as IUser;
  };

  async update(id: number, dto: UpdateUserDto) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    Object.assign(user, dto);

    // If password is being updated, hash it before saving
    if (dto.password) {
      user.password = await hashBcrypt(dto.password);
    }

    await this.userRepository.save(user);

    return {
      success: true,
      message: 'User updated successfully',
      data: user,
    };
  }
}
