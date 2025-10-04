import { ConflictException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BaseSqlService } from "src/core/base/services/sql.base.service";
import { FindOptionsWhere, In, IsNull, Like, Not, Repository } from "typeorm";
import { IUser } from "../user/interface/user.interface";
import { User } from "src/database/entities/user.entity";
import { ERole } from "src/common/enums/role.enum";
import { CreateStaffDto, UpdateStaffDto } from "./dto/create-staff.dto";
import { hashBcrypt, removeSensitiveData } from "src/common/utils/app.util";

@Injectable()
export class StaffService extends BaseSqlService<User, IUser> {
  private readonly logger = new Logger(StaffService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super(userRepository);
  }

  async list(page: number, limit: number, query?: string, trash?: boolean) {
    let where: FindOptionsWhere<User>[] | FindOptionsWhere<User>;

    const baseFilter = { role: In([ERole.MANAGER, ERole.ORDER_MANAGER]) };

    if (query) {
      const search = `%${query}%`;

      where = [
        { ...baseFilter, firstName: Like(search) },
        { ...baseFilter, lastName: Like(search) },
        { ...baseFilter, email: Like(search) },
        { ...baseFilter, phone: Like(search) },
      ];
    } else {
      where = { ...baseFilter };
    }

    if (trash) {
      if (Array.isArray(where)) {
        where = where.map((w) => ({
          ...w,
          deletedAt: Not(IsNull()),
        }));
      } else {
        where = { ...where, deletedAt: Not(IsNull()) };
      }

      return this.paginate<IUser>(page, limit, {
        where,
        order: { createdAt: "DESC" },
        withDeleted: true,
      });
    }

    return this.paginate<IUser>(page, limit, {
      where,
      order: { createdAt: "DESC" },
    });
  }


  async show(id: number) {
    const user = await this.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException("Staff not found");
    }

    return removeSensitiveData(user);
  }

  async update(id: number, body: UpdateStaffDto) {
    const user = await this.userRepository.findOne({ where: { id }, withDeleted: true });

    if (!user) {
      throw new NotFoundException(`Staff with ID ${id} not found`);
    }

    let hashedPassword = user.password;

    if (body.password) {
      hashedPassword = await hashBcrypt(body.password!);
    }

    const updatedUser = this.userRepository.merge(user, {
      ...body,
      password: hashedPassword
    });

    return await this.userRepository.save(updatedUser);
  }

  async createStaff(body: CreateStaffDto) {
    const existing = await this.userRepository.findOne({
      where: { email: body.email },
    });

    if (existing) {
      throw new ConflictException("Staff with this email already exists");
    }

    const hashedPassword = await hashBcrypt(body.password);

    const user = await this.create({
      ...body,
      password: hashedPassword
    });

    return removeSensitiveData(user);
  }
}
