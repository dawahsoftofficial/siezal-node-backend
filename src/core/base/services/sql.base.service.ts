import {
  DeepPartial,
  EntityManager,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  ObjectLiteral,
  Repository,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { instanceToPlain } from 'class-transformer';
import { getPaginationMetadata } from 'src/common/utils/pagination.utils';
import { IPaginatedResponse, IPaginationMetadata } from 'src/common/interfaces/app.interface';
/**
 * A generic base service class providing common database operations.
 *
 * TEntity    => Entity Type (TypeORM Entity)
 * TInterface => DTO / Interface Type (for returning clean data)
 */
export abstract class BaseSqlService<
  TEntity extends ObjectLiteral,
  TInterface extends DeepPartial<TEntity>,
> {
  constructor(
    protected readonly repository: Repository<TEntity>,
    private readonly primaryKey: keyof TInterface = 'id' as keyof TInterface, // Default primary key as 'id'
  ) {}

  // ===========================
  // FIND ONE RECORD
  // ===========================

  /**
   * Find a single record by FindOneOptions.
   */

  async findOne(options: FindOneOptions<TEntity>): Promise<TInterface | null> {
    const entity = await this.repository.findOne(options);
    if (!entity) return null;

    // Return entity or transformed interface
    return entity as TInterface;
  }

  // ===========================
  // FIND ONE RECORD BY ID
  // ===========================

  /**
   * Find a single record by ID.
   */
  async findById(
    id: number | string,
    options?: Omit<FindOneOptions<TEntity>, 'where'>,
  ): Promise<TInterface | null> {
    const whereCondition = {
      [this.primaryKey]: id,
    } as FindOptionsWhere<TEntity>;

    const entity = await this.repository.findOne({
      where: whereCondition,
      ...options,
    });

    if (!entity) return null;

    return entity as TInterface;
  }

  // ===========================
  // CHECK IF RECORD EXISTS
  // ===========================

  /**
   * Check whether a record exists by condition.
   */
  async exists(condition: FindOptionsWhere<TEntity>): Promise<boolean> {
    return await this.repository.existsBy(condition);
  }

  // ===========================
  // FIND ALL RECORDS
  // ===========================

  /**
   * Get all records.
   */
  async findAll(options?: FindManyOptions<TEntity>): Promise<TInterface[]> {
    const entities = await this.repository.find(options);
    const plainObjects = instanceToPlain(entities);
    return plainObjects as TInterface[];
  }

  // ===========================
  // CREATE NEW RECORD
  // ===========================

  /**
   * Create a new record.
   */
  async create(
    data: DeepPartial<TInterface>,
    manager?: EntityManager,
  ): Promise<TInterface> {
    const repo = manager
      ? manager.getRepository(this.repository.target)
      : this.repository;

    const entity = repo.create(data as unknown as DeepPartial<TEntity>);
    const saved = await repo.save(entity);

    return saved as unknown as TInterface;
  }

  // ===========================
  // UPDATE RECORD BY ID
  // ===========================

  /**
   * Update an existing record by ID.
   */
  async updateById(
    id: number | string,
    data: QueryDeepPartialEntity<TInterface>,
    options: {
      returnUpdated?: boolean; // ✅ Renamed param to avoid using "new"
      manager?: EntityManager;
    } = {},
  ): Promise<TInterface | number | null> {
    const { manager, returnUpdated = false } = options;
    const repo = manager
      ? manager.getRepository(this.repository.target)
      : this.repository;

    const whereCondition = {
      [this.primaryKey]: id,
    } as FindOptionsWhere<TEntity>;

    const { affected } = await repo.update(
      whereCondition,
      data as QueryDeepPartialEntity<TEntity>,
    );
    if (!affected || affected === 0) {
      return null;
    }
    if (!returnUpdated) {
      return affected;
    }

    const updatedEntity = (await this.findById(id)) as TInterface;
    return manager ? { ...updatedEntity, ...data } : updatedEntity;
  }

  async updateOne(
    whereCondition: FindOptionsWhere<TEntity>,
    data: QueryDeepPartialEntity<TInterface>,
    options: {
      returnUpdated?: boolean; // ✅ Renamed param to avoid using "new"
      manager?: EntityManager;
    } = {},
  ): Promise<TInterface | number | null> {
    const { manager, returnUpdated = false } = options;
    const repo = manager
      ? manager.getRepository(this.repository.target)
      : this.repository;
    const { affected } = await repo.update(
      whereCondition,
      data as QueryDeepPartialEntity<TEntity>,
    );
    // No rows were affected
    if (!affected || affected === 0) {
      return null;
    }
    if (!returnUpdated) {
      return affected;
    }
    // Fetch and return the updated entity
    const updatedEntity = (await this.findOne({
      where: whereCondition,
    })) as TInterface;

    // If using a manager (transaction), merge updated values for consistency
    return manager ? { ...updatedEntity, ...data } : updatedEntity;
  }

  async updateMany(
    whereCondition: FindOptionsWhere<TEntity>,
    data: QueryDeepPartialEntity<TInterface>,
    manager?: EntityManager,
  ): Promise<number> {
    const repo = manager
      ? manager.getRepository(this.repository.target)
      : this.repository;
    const { affected } = await repo.update(
      whereCondition,
      data as QueryDeepPartialEntity<TEntity>,
    );
    return affected || 0;
  }

  // ===========================
  // DELETE RECORD(S)
  // ===========================

  /**
   * Permanently delete record(s) by ID(s).
   */
  async deleteByIds(
    ids: number | string | number[] | string[],
    manager?: EntityManager,
  ): Promise<boolean> {
    const repo = manager
      ? manager.getRepository(this.repository.target)
      : this.repository;

    const { affected } = await repo.delete(ids);
    return affected && affected > 0 ? true : false;
  }

  async deleteMany(
    options: FindOptionsWhere<TEntity>,
    manager?: EntityManager,
  ): Promise<boolean> {
    const repo = manager
      ? manager.getRepository(this.repository.target)
      : this.repository;

    const { affected } = await repo.delete(options);
    return affected && affected > 0 ? true : false;
  }

  // ===========================
  // SOFT DELETE RECORD(S)
  // ===========================

  /**
   * Soft delete record(s) by ID(s).
   */
  async softDelete(
    ids: number | string | number[] | string[],
    manager?: EntityManager,
  ): Promise<boolean> {
    const repo = manager
      ? manager.getRepository(this.repository.target)
      : this.repository;

    const { affected } = await repo.softDelete(ids);
    return affected && affected > 0 ? true : false;
  }

  // ===========================
  // RESTORE RECORD(S)
  // ===========================

  /**
   * Restore soft-deleted record(s) by ID(s).
   */
  async restore(
    ids: number | string | number[] | string[],
    manager?: EntityManager,
  ): Promise<boolean> {
    const repo = manager
      ? manager.getRepository(this.repository.target)
      : this.repository;

    const { affected } = await repo.restore(ids);
    return affected && affected > 0 ? true : false;
  }

  // ===========================
  // COUNT RECORDS
  // ===========================

  /**
   * Count total records based on condition.
   */
  async count(where?: FindOptionsWhere<TEntity>): Promise<number> {
    return this.repository.count({ where });
  }

  // ===========================
  // FIND AND COUNT
  // ===========================

  /**
   * Find records and get total count.
   */

  async findAndCount(
    options?: FindManyOptions<TEntity>,
  ): Promise<[TInterface[], number]> {
    const [entities, count] = await this.repository.findAndCount(options);
    return [entities as TInterface[], count];
  }

  // ===========================
  // CREATE OR UPDATE (UPSERT)
  // ===========================

  /**
   * Create or update (upsert) records.
   * Returns array of affected record IDs and count.
   */
  async createOrUpdate(
    data:
      | QueryDeepPartialEntity<TInterface>
      | QueryDeepPartialEntity<TInterface>[],
    conflictPaths: (keyof TEntity)[],
    manager?: EntityManager,
  ): Promise<{ ids: (number | string)[]; affected: number }> {
    const repo = manager
      ? manager.getRepository(this.repository.target)
      : this.repository;

    const result = await repo.upsert(
      data as
        | QueryDeepPartialEntity<TEntity>
        | QueryDeepPartialEntity<TEntity>[],
      {
        conflictPaths: conflictPaths as string[],
      },
    );

    const ids = result.identifiers.map((id) => id[this.primaryKey as any]);

    return {
      ids,
      affected: ids.length,
    };
  }

  // ===========================
  // PAGINATION
  // ===========================

  /**
   * Paginate records.
   * Returns paginated result with current page, total, and lastPage.
   */
  async paginate<TInterface>(
    page: number = 1,
    limit: number = 10,
    options?: FindManyOptions<TEntity>,
): Promise<IPaginatedResponse<TInterface>> {
  const [entities, total] = await this.repository.findAndCount({
    ...options ? options : {},
    skip: (page - 1) * limit,
    take: limit,
  });

  const plainObjects = instanceToPlain(entities) as TInterface[];
  
  const pagination: IPaginationMetadata = getPaginationMetadata(
    total,page, limit
  );

  return {
    data: plainObjects,
    pagination,
  };
}
}
