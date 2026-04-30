import { ConflictException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BaseSqlService } from "src/core/base/services/sql.base.service";
import { FindOptionsWhere, In, IsNull, Like, Not, Repository } from "typeorm";
import { IUser } from "../user/interface/user.interface";
import { User } from "src/database/entities/user.entity";
import { ERole } from "src/common/enums/role.enum";
import { CreateStaffDto, UpdateStaffDto } from "./dto/create-staff.dto";
import { hashBcrypt, removeSensitiveData } from "src/common/utils/app.util";
import { Branch } from "src/database/entities/branch.entity";

@Injectable()
export class StaffService extends BaseSqlService<User, IUser> {
  private readonly logger = new Logger(StaffService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
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
        relations: {
          branch: true,
        },
      });
    }

    return this.paginate<IUser>(page, limit, {
      where,
      order: { createdAt: "DESC" },
      relations: {
        branch: true,
      },
    });
  }


  async show(id: number) {
    const user = await this.findOne({ where: { id }, relations: { branch: true } });

    if (!user) {
      throw new NotFoundException("Staff not found");
    }

    return removeSensitiveData(user);
  }

  async update(id: number, body: UpdateStaffDto) {
    const user = await this.userRepository.findOne({
      where: { id },
      withDeleted: true,
      relations: {
        branch: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`Staff with ID ${id} not found`);
    }

    if (body.email) {
      const existingByEmail = await this.userRepository.findOne({
        where: { email: body.email },
        withDeleted: true,
      });

      if (existingByEmail && existingByEmail.id !== id) {
        throw new ConflictException("A user with this email already exists");
      }
    }

    if (body.phone) {
      const existingByPhone = await this.userRepository.findOne({
        where: { phone: body.phone },
        withDeleted: true,
      });

      if (existingByPhone && existingByPhone.id !== id) {
        throw new ConflictException("A user with this phone number already exists");
      }
    }

    if (Object.prototype.hasOwnProperty.call(body, "branchId")) {
      if (body.branchId === null) {
        user.branch = null;
        user.branchId = null;
      } else if (body.branchId !== undefined) {
        const branch = await this.branchRepository.findOne({
          where: {
            id: body.branchId,
            deletedAt: IsNull(),
          },
        });

        if (!branch) {
          throw new NotFoundException(`Branch with ID ${body.branchId} not found`);
        }

        user.branch = branch;
        user.branchId = branch.id;
      }
    }

    let hashedPassword = user.password;

    if (body.password) {
      hashedPassword = await hashBcrypt(body.password!);
    }

    const updatedUser = this.userRepository.merge(user, {
      ...body,
      password: hashedPassword
    });

    await this.userRepository.save(updatedUser);

    return removeSensitiveData(
      await this.userRepository.findOne({
        where: { id },
        withDeleted: true,
        relations: {
          branch: true,
        },
      }),
    );
  }

  async createStaff(body: CreateStaffDto) {
    const existingByEmail = await this.userRepository.findOne({
      where: { email: body.email },
      withDeleted: true,
    });

    if (existingByEmail) {
      throw new ConflictException("A user with this email already exists");
    }

    const existingByPhone = await this.userRepository.findOne({
      where: { phone: body.phone },
      withDeleted: true,
    });

    if (existingByPhone) {
      throw new ConflictException("A user with this phone number already exists");
    }

    const hashedPassword = await hashBcrypt(body.password);
    let branch: Branch | null = null;

    if (body.branchId !== undefined && body.branchId !== null) {
      branch = await this.branchRepository.findOne({
        where: {
          id: body.branchId,
          deletedAt: IsNull(),
        },
      });

      if (!branch) {
        throw new NotFoundException(`Branch with ID ${body.branchId} not found`);
      }
    }

    const user = await this.create({
      ...body,
      password: hashedPassword,
      branch,
    });

    return removeSensitiveData(
      await this.userRepository.findOne({
        where: { id: user.id },
        relations: {
          branch: true,
        },
      }),
    );
  }
}
