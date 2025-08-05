import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BaseSqlService } from "src/core/base/services/sql.base.service";
import { Product } from "src/database/entities/product.entity";
import { Repository } from "typeorm";
import { IProduct } from "./interface/product.interface";

@Injectable()
export class ProductService extends BaseSqlService<Product, IProduct> {
    constructor(
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
    ) {
        super(productRepository);
    }

    async index(page: number, limit: number, filters: any) {
        const qb = this.productRepository
            .createQueryBuilder('product')
            .leftJoinAndSelect('product.inventory', 'inventory')
            .leftJoinAndSelect('product.attributePivots', 'pivot')
            .leftJoinAndSelect('pivot.attribute', 'attribute');

        if (filters.categoryId) {
            qb.andWhere('product.categoryId = :categoryId', { categoryId: filters.categoryId });
        }

        if (filters.q) {
            qb.andWhere(
                '(LOWER(product.title) LIKE LOWER(:q) OR LOWER(product.description) LIKE LOWER(:q))',
                { q: `%${filters.q}%` },
            );
        }

        if (filters.tags?.length) {
            qb.andWhere(
                '(LOWER(attribute.name) IN (:...tags) OR CAST(attribute.id AS TEXT) IN (:...tags))',
                { tags: filters.tags.map(t => t.toLowerCase()) },
            );
        }

        qb.skip((page - 1) * limit).take(limit).orderBy('product.createdAt', 'DESC');

        const [data, total] = await qb.getManyAndCount();

        // const [data, total] = await this.productRepository.findAndCount({
        //     where: filter,
        //     skip: (page - 1) * limit,
        //     take: limit,
        //     order: { createdAt: 'DESC' },
        // });

        return {
            data,
            total
        };
    }

    async show(id: number) {
        const product = await this.productRepository.findOne({ where: { id } });

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        return product;
    }
}
