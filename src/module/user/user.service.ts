import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BaseSqlService } from "src/core/base/services/sql.base.service";
import { FindOptionsWhere, IsNull, Like, Not, Repository } from "typeorm";
import { IUser } from "./interface/user.interface";
import { User } from "src/database/entities/user.entity";
import { ERole } from "src/common/enums/role.enum";
import { instanceToPlain } from "class-transformer";
import { UpdateUserDto } from "./dto/update-user.dto";

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

  async list(page: number, limit: number, query?: string) {
    let where: FindOptionsWhere<User>[] = [];

    if (query) {
      const search = `%${query}%`;

      where = [
        { firstName: Like(search) },
        { lastName: Like(search) },
        { email: Like(search) },
        { phone: Like(search) },
      ];
    }

    return this.paginate<IUser>(page, limit, {
      where: where.length > 0 ? where : {},
      order: { createdAt: "DESC" },
    });
  }

  async show(id: number) {
    const user = await this.userRepository.findOne({ where: { id }, relations: ['fcmTokens'] });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user;
  }

  async update(id: number, body: UpdateUserDto) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const updatedUser = this.userRepository.merge(user, body);

    return await this.userRepository.save(updatedUser);
  }

  listUserHavingFcmToken() {
    return this.userRepository.find({
      where: {
        fcmTokens: { id: Not(IsNull()) }, // "Not null" forces at least one match
      },
      select: ["id", "firstName", "lastName", "phone", "email"],
    });
  }
}
