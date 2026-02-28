import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BaseSqlService } from "src/core/base/services/sql.base.service";
import { Branch } from "src/database/entities/branch.entity";
import { FindOptionsWhere, IsNull, Like, Not, Repository } from "typeorm";
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

      return this.paginate<IBranch>(page, limit, {
        where,
        withDeleted: true,
        order: { createdAt: "DESC" },
      });
    }

    return this.paginate<IBranch>(page, limit, {
      where,
      order: { createdAt: "DESC" },
    });
  }

  async show(id: number) {
    const branch = await this.findOne({ where: { id } });

    if (!branch) {
      throw new NotFoundException("Branch not found");
    }

    return branch;
  }

  async listActive() {
    return this.findAll({
      where: {
        isActive: true,
        deletedAt: IsNull(),
      },
      order: {
        name: "ASC",
      },
    });
  }

  async createBranch(body: CreateBranchDto) {
    return this.create({
      ...body,
      isActive: body.isActive ?? true,
    });
  }

  async updateBranch(id: number, body: UpdateBranchDto) {
    const branch = await this.branchRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!branch) {
      throw new NotFoundException(`Branch with ID ${id} not found`);
    }

    const updatedBranch = this.branchRepository.merge(branch, body);

    return this.branchRepository.save(updatedBranch);
  }
}
