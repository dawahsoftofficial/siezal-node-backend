import { DataSource } from 'typeorm';
import { Product } from '../entities/product.entity';
import { Attribute } from '../entities/attribute.entity';
import { ProductAttributePivot } from '../entities/product-attributes.entity';

export default class ProductAttributePivotSeeder {
    public static async run(dataSource: DataSource): Promise<void> {
        const productRepo = dataSource.getRepository(Product);
        const attributeRepo = dataSource.getRepository(Attribute);
        const pivotRepo = dataSource.getRepository(ProductAttributePivot);

        await dataSource.transaction(async (tem) => {
            // await tem.clear(ProductAttributePivot);

            const products = await productRepo.find();
            const attributes = await attributeRepo.find();

            if (!products.length || !attributes.length) {
                throw new Error('Products or Attributes missing — seed them first.');
            }

            const pivots: ProductAttributePivot[] = [];

            for (const product of products) {
                // pick 2–4 random attributes
                const shuffled = [...attributes].sort(() => Math.random() - 0.5);
                const selected = shuffled.slice(0, Math.floor(Math.random() * 3) + 2);

                for (const attr of selected) {
                    pivots.push(
                        pivotRepo.create({
                            productId: product.id,
                            attributeId: attr.id,
                        })
                    );
                }
            }

            await tem.save(pivots);
        });
    }
}
