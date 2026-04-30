import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BaseSqlService } from "src/core/base/services/sql.base.service";
import { Branch } from "src/database/entities/branch.entity";
import { FindOptionsWhere, IsNull, Like, Not, Repository } from "typeorm";
import {
  normalizeBranchDeliveryAreas,
  normalizeBranchServiceArea,
  normalizeBranchWeeklySchedule,
} from "./branch.utils";
import { CreateBranchDto, UpdateBranchDto } from "./dto/create-branch.dto";
import { IBranch } from "./interface/branch.interface";

@Injectable()
export class BranchService extends BaseSqlService<Branch, IBranch> {
  constructor(
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
  ) {
    super(branchRepository);
  }

  async list(page: number, limit: number, query?: string, trash?: boolean) {
    let where: FindOptionsWhere<Branch>[] | FindOptionsWhere<Branch>;

    if (query) {
      const search = `%${query}%`;

      where = [
        { name: Like(search) },
        { address: Like(search) },
        { phone: Like(search) },
        { email: Like(search) },
      ];
    } else {
      where = {};
    }

    if (trash) {
      if (Array.isArray(where)) {
        where = where.map(item => ({
          ...item,
          deletedAt: Not(IsNull()),
        }));
      } else {
        where = {
          ...where,
          deletedAt: Not(IsNull()),
        };
      }

      const paginated = await this.paginate<IBranch>(page, limit, {
        where,
        withDeleted: true,
        order: { createdAt: "DESC" },
      });

      return {
        ...paginated,
        data: paginated.data.map(branch => this.normalizeBranch(branch)),
      };
    }

    const paginated = await this.paginate<IBranch>(page, limit, {
      where,
      order: { createdAt: "DESC" },
    });

    return {
      ...paginated,
      data: paginated.data.map(branch => this.normalizeBranch(branch)),
    };
  }

  async show(id: number) {
    const branch = await this.findOne({ where: { id } });

    if (!branch) {
      throw new NotFoundException("Branch not found");
    }

    return this.normalizeBranch(branch);
  }

  async listActive() {
    const branches = await this.findAll({
      where: {
        isActive: true,
        deletedAt: IsNull(),
      },
      order: {
        name: "ASC",
      },
    });

    return branches.map(branch => this.normalizeBranch(branch));
  }

  async createBranch(body: CreateBranchDto) {
    const created = await this.create({
      ...body,
      isActive: body.isActive ?? true,
      isEcommerceEnabled: body.isEcommerceEnabled ?? true,
      weeklySchedule: normalizeBranchWeeklySchedule(body.weeklySchedule),
      deliveryAreas: normalizeBranchDeliveryAreas(body.deliveryAreas),
      serviceArea: normalizeBranchServiceArea(body.serviceArea),
    });

    return this.normalizeBranch(created);
  }

  async updateBranch(id: number, body: UpdateBranchDto) {
    const branch = await this.branchRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!branch) {
      throw new NotFoundException(`Branch with ID ${id} not found`);
    }

    const nextBody: UpdateBranchDto = { ...body };

    if (Object.prototype.hasOwnProperty.call(body, "weeklySchedule")) {
      nextBody.weeklySchedule = normalizeBranchWeeklySchedule(body.weeklySchedule);
    }

    if (Object.prototype.hasOwnProperty.call(body, "deliveryAreas")) {
      nextBody.deliveryAreas = normalizeBranchDeliveryAreas(body.deliveryAreas);
    }

    if (Object.prototype.hasOwnProperty.call(body, "serviceArea")) {
      nextBody.serviceArea = normalizeBranchServiceArea(body.serviceArea);
    }

    const updatedBranch = this.branchRepository.merge(branch, nextBody);

    const savedBranch = await this.branchRepository.save(updatedBranch);

    return this.normalizeBranch(savedBranch);
  }

  private normalizeBranch(branch: IBranch): IBranch {
    return {
      ...branch,
      weeklySchedule: normalizeBranchWeeklySchedule(branch.weeklySchedule),
      deliveryAreas: normalizeBranchDeliveryAreas(branch.deliveryAreas),
      serviceArea: normalizeBranchServiceArea(branch.serviceArea),
    };
  }
}
