import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BaseSqlService } from "src/core/base/services/sql.base.service";
import { FindOptionsWhere, In, IsNull, Like, Not, Repository } from "typeorm";
import { IUser } from "./interface/user.interface";
import { User } from "src/database/entities/user.entity";
import { ERole } from "src/common/enums/role.enum";
import { instanceToPlain } from "class-transformer";
import { UpdateUserDto } from "./dto/update-user.dto";
import { AddressService } from "../address/address.service";
import { NotificationService } from "../notification/notification.service";

@Injectable()
export class UserService extends BaseSqlService<User, IUser> {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly addressService: AddressService,
    private readonly notificationService: NotificationService,
  ) {
    super(userRepository);
  }

  async loginVerify(
    identifier: string,
    role = ERole.USER
  ): Promise<IUser | null> {
    const filter =
      role === ERole.USER ? { phone: identifier } : { email: identifier };
    return instanceToPlain(
      await this.findOne({ where: { ...filter, role: role === ERole.USER ? role : In([ERole.ADMIN, ERole.MANAGER, ERole.ORDER_MANAGER]) } })
    ) as IUser | null;
  }

  async list(page: number, limit: number, query?: string, trash?: boolean) {
    let where: FindOptionsWhere<User>[] | FindOptionsWhere<User> = {};

    if (query) {
      const search = `%${query}%`;

      where = [
        { firstName: Like(search) },
        { lastName: Like(search) },
        { email: Like(search) },
        { phone: Like(search) },
      ];
    }

    if (trash) {
      if (Array.isArray(where) && where.length > 0) {
        where = where.map((w) => ({ ...w, deletedAt: Not(IsNull()) }));
      } else {
        where = { deletedAt: Not(IsNull()) };
      }

      return this.paginate<IUser>(page, limit, {
        where,
        order: { createdAt: "DESC" },
        withDeleted: true,
      });
    } else {
      if (Array.isArray(where) && where.length > 0) {
        where = where.map((w) => ({ ...w }));
      }

      return this.paginate<IUser>(page, limit, {
        where,
        order: { createdAt: "DESC" },
      });
    }
  }

  async show(id: number) {
    const user = await this.userRepository.findOne({ where: { id }, relations: ['fcmTokens', 'addresses'] });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user;
  }

  async update(id: number, body: UpdateUserDto) {
    const { shippingAddressLine1, shippingAddressLine2, shippingPostalCode, shippingCity, shippingCountry, shippingState, ...rest } = body

    const user = await this.userRepository.findOne({ where: { id }, withDeleted: true });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    try {
      if (user.isBanned !== body.isBanned) {
        if (body.isBanned) {
          await this.notificationService.sendNotification({
            userIds: [user.id!],
            title: 'Account Suspended',
            body: 'Your account has been banned due to policy violations. Please contact support for more details.'
          })
        } else {
          await this.notificationService.sendNotification({
            userIds: [user.id!],
            title: 'Account Restored',
            body: 'Good news! Your account ban has been lifted, and you can now access all features again.'
          })
        }
      }
    } catch (error) {
      this.logger.error('Failed to send user ban/unban notification', error.stack)
    }

    const updatedUser = this.userRepository.merge(user, rest);

    if (shippingAddressLine1) {
      await this.addressService.createOrUpdate({
        userId: id,
        shippingAddressLine1,
        shippingAddressLine2,
        shippingPostalCode,
        shippingCity,
        shippingCountry,
        shippingState
      }, ['userId']);
    }

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
