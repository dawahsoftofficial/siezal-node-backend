import { DataSource } from 'typeorm';
import { Product } from '../entities/product.entity';
import { EInventoryStatus } from 'src/common/enums/inventory-status.enum';

export default class ProductSeeder {
    public static async run(dataSource: DataSource): Promise<void> {
        const productRepository = dataSource.getRepository(Product);

        await dataSource.transaction(async (transactionalEntityManager) => {
            // await transactionalEntityManager.clear(Product);

            const makeSlug = (title: string) =>
                title.toLowerCase()
                    .replace(/&/g, 'and')
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)+/g, '');

            const categoryMap: Record<number, string[]> = {
                1: ['Fresh Red Apples', 'Green Apples', 'Golden Apples', 'Apple Juice', 'Organic Apples'],
                2: ['Ripe Bananas', 'Organic Bananas', 'Banana Chips', 'Banana Smoothie Mix', 'Mini Bananas'],
                3: ['Strawberries', 'Blueberries', 'Blackberries', 'Raspberries', 'Berry Mix Pack'],
                4: ['Oranges', 'Mandarins', 'Grapefruit', 'Limes', 'Lemons'],
                5: ['Mangoes', 'Pineapples', 'Papayas', 'Passion Fruit', 'Dragon Fruit'],
                6: ['Leafy Spinach', 'Kale', 'Romaine Lettuce', 'Arugula', 'Cabbage'],
                7: ['Carrots', 'Beetroots', 'Radishes', 'Sweet Potatoes', 'Turnips'],
                8: ['Tomatoes', 'Cherry Tomatoes', 'Cucumbers', 'Organic Tomatoes', 'Roma Tomatoes'],
                9: ['Bell Peppers', 'Chili Peppers', 'Jalapenos', 'Sweet Peppers', 'Mixed Peppers'],
                10: ['White Mushrooms', 'Shiitake Mushrooms', 'Oyster Mushrooms', 'Portobello Mushrooms', 'Button Mushrooms'],
                11: ['Whole Milk', 'Low Fat Milk', 'Almond Milk', 'Oat Milk', 'Soy Milk'],
                12: ['Cheddar Cheese', 'Mozzarella Cheese', 'Feta Cheese', 'Parmesan Cheese', 'Cream Cheese'],
                13: ['Greek Yogurt', 'Strawberry Yogurt', 'Plain Yogurt', 'Vanilla Yogurt', 'Honey Yogurt'],
            };

            const products: Product[] = [];
            let productCount = 0;

            while (productCount < 100) {
                for (const [categoryIdStr, productNames] of Object.entries(categoryMap)) {
                    const categoryId = parseInt(categoryIdStr, 10);

                    // Add multiple products per category
                    for (let i = 0; i < productNames.length && productCount < 100; i++) {
                        const title = productNames[i];
                        const slug = makeSlug(title);
                        const sku = `${slug.substring(0, 3).toUpperCase()}-${String(productCount + 1).padStart(4, '0')}`;

                        const price = (Math.random() * 10 + 1).toFixed(2);
                        const salePrice = Math.random() < 0.3 ? (parseFloat(price) - Math.random() * 2).toFixed(2) : undefined;

                        const stockQuantity = Math.floor(Math.random() * 200) + 1;

                        const status =
                            stockQuantity === 0
                                ? EInventoryStatus.OUT_OF_STOCK
                                : EInventoryStatus.AVAILABLE;

                        products.push(
                            productRepository.create({
                                sku,
                                title,
                                slug,
                                shortDescription: `${title} — fresh, high-quality, and perfect for your kitchen.`,
                                description: `Our ${title.toLowerCase()} are carefully selected to ensure top-notch freshness and taste.`,
                                seoTitle: `Buy ${title} Online`,
                                seoDescription: `Order ${title.toLowerCase()} online and get them delivered fresh to your doorstep.`,
                                price: parseFloat(price),
                                salePrice: salePrice ? parseFloat(salePrice) : undefined,
                                stockQuantity,
                                status,
                                categoryId,
                                inventoryId: 1,
                                image: `/products/${slug}.jpg`,
                                gallery: [`/products/${slug}-1.jpg`, `/products/${slug}-2.jpg`],
                            })
                        );

                        productCount++;
                    }
                }
            }

            await transactionalEntityManager.save(products);
        });
    }
}
