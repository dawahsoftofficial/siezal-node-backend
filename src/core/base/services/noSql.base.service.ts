import { instanceToPlain } from 'class-transformer';
import { FilterQuery, Model, UpdateQuery, QueryOptions, Types } from 'mongoose';

interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  lastPage: number;
}

/**
 * Generic Mongoose Base Service returning plain objects
 * @template T - Plain object type
 * @template DocType - Mongoose Document Type
 */
export abstract class BaseNoSqlService<T, DocType> {
  constructor(protected readonly model: Model<T>) {}

  // ==========================
  // FIND ONE RECORD
  // ==========================
  async findOne(
    filter: FilterQuery<T>,
    options?: QueryOptions,
  ): Promise<T | null> {
    return await this.model.findOne(filter, null, options).lean<T>().exec();
  }

  // ==========================
  // FIND ONE BY ID
  // ==========================
  async findById(
    id: string | Types.ObjectId,
    options?: QueryOptions,
  ): Promise<T | null> {
    return await this.model.findById(id, null, options).lean<T>().exec();
  }

  // ==========================
  // FIND MANY RECORDS
  // ==========================
  async findAll(
    filter: FilterQuery<T> = {},
    options?: QueryOptions,
  ): Promise<T[]> {
    return (await this.model.find(filter, null, options).lean().exec()) as T[];
  }

  // ==========================
  // EXISTS
  // ==========================
  async exists(filter: FilterQuery<T>): Promise<boolean> {
    return await this.model.exists(filter).then((doc) => !!doc);
  }

  // ==========================
  // CREATE
  // ==========================
  async create(data: Partial<T>): Promise<T> {
    const created = await this.model.create(data);
    return created;
  }

  // ==========================
  // CREATE MANY
  // ==========================
  async createMany(data: Partial<T>[]): Promise<T[]> {
    const docs = await this.model.insertMany(data);
    return docs.map((doc) => instanceToPlain(doc)) as T[];
  }

  // ==========================
  // UPDATE BY ID
  // ==========================
  async updateById(
    id: string | Types.ObjectId,
    data: UpdateQuery<T>,
  ): Promise<T | null> {
    return await this.model
      .findByIdAndUpdate(id, data, { new: true })
      .lean<T>()
      .exec();
  }

  // ==========================
  // UPDATE ONE
  // ==========================
  async updateOne(
    filter: FilterQuery<T>,
    data: UpdateQuery<T>,
  ): Promise<T | null> {
    return await this.model
      .findOneAndUpdate(filter, data, { new: true })
      .lean<T>()
      .exec();
  }

  // ==========================
  // UPDATE MANY
  // ==========================
  async updateMany(
    filter: FilterQuery<T>,
    data: UpdateQuery<T>,
  ): Promise<number> {
    const res = await this.model.updateMany(filter, data);
    return res.modifiedCount;
  }

  // ==========================
  // DELETE BY ID
  // ==========================
  async deleteById(id: string | Types.ObjectId): Promise<boolean> {
    const res = await this.model.deleteOne({ _id: id });
    return res.deletedCount > 0;
  }

  // ==========================
  // DELETE MANY
  // ==========================
  async deleteMany(filter: FilterQuery<T>): Promise<number> {
    const res = await this.model.deleteMany(filter);
    return res.deletedCount || 0;
  }

  // ==========================
  // PAGINATION
  // ==========================
  async paginate(
    filter: FilterQuery<T> = {},
    page = 1,
    limit = 10,
    options: QueryOptions = {},
  ): Promise<PaginationResult<T>> {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.model
        .find(filter, null, {
          ...options,
          skip,
          limit,
        })
        .lean()
        .exec(),

      this.model.countDocuments(filter),
    ]);

    return {
      data: data as T[],
      total,
      page,
      lastPage: limit > 0 ? Math.ceil(total / limit) : 1,
    };
  }

  // ==========================
  // COUNT
  // ==========================
  async count(filter: FilterQuery<T> = {}): Promise<number> {
    return await this.model.countDocuments(filter);
  }

  async createOrUpdate(filter: FilterQuery<T>, data: Partial<T>): Promise<T> {
    return (await this.model.updateOne(
      filter,
      { $set: data },
      { upsert: true },
    )) as T;
  }
}
