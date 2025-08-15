import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BaseSqlService } from "src/core/base/services/sql.base.service";
import { FindOptionsWhere, Like, Repository } from "typeorm";
import { IUser } from "./interface/user.interface";
import { User } from "src/database/entities/user.entity";
import { ERole } from "src/common/enums/role.enum";
import { instanceToPlain } from "class-transformer";

@Injectable()
export class UserService extends BaseSqlService<User, IUser> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {
    super(userRepository);
  }

  async loginVerify(
    identifier: string,
    role = ERole.USER
  ): Promise<IUser | null> {
    const filter =
      role === ERole.ADMIN ? { email: identifier } : { phone: identifier };
    return instanceToPlain(
      await this.findOne({ where: { ...filter, role } })
    ) as IUser | null;
  }

  async findByRefreshToken(refreshToken: string) {
    return (await this.userRepository.findOne({
      where: { refreshToken },
    })) as IUser;
  };

  async list(page: number, limit: number, query?: string) {
    let where: FindOptionsWhere<User>[] = [];

    if (query) {
      const search = `%${query}%`;
      
      where = [
        { firstName: Like(search) },
        { lastName: Like(search) },
        { email: Like(search) },
        { phone: Like(search) }
      ];
    }

    return this.paginate<IUser>(page, limit, {
      where: where.length > 0 ? where : {},
    });
  }
}
