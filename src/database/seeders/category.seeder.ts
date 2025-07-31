// src/database/seeds/category.seeder.ts
import { DataSource } from 'typeorm';
import { Category } from '../entities/category.entity';

type CategoryDefinition = {
  name: string;
  slug: string;
  children?: Omit<CategoryDefinition, 'children'>[];
};

export default class CategorySeeder {
  public static async run(dataSource: DataSource): Promise<void> {
    const categoryRepository = dataSource.getRepository(Category);

    // Use transaction for better performance
    await dataSource.transaction(async (transactionalEntityManager) => {
      // Clear existing data more efficiently

      // Define category hierarchy in a clean structure
      const categories: CategoryDefinition[] = [
        {
          name: 'Fruits',
          slug: 'fruits',
          children: [
            { name: 'Apples', slug: 'apples' },
            { name: 'Bananas', slug: 'bananas' },
            { name: 'Berries', slug: 'berries' },
            { name: 'Citrus', slug: 'citrus' },
            { name: 'Tropical', slug: 'tropical' },
          ],
        },
        {
          name: 'Vegetables',
          slug: 'vegetables',
          children: [
            { name: 'Leafy Greens', slug: 'leafy-greens' },
            { name: 'Root Vegetables', slug: 'root-vegetables' },
            { name: 'Tomatoes & Cucumbers', slug: 'tomatoes-cucumbers' },
            { name: 'Peppers', slug: 'peppers' },
            { name: 'Mushrooms', slug: 'mushrooms' },
          ],
        },
        {
          name: 'Dairy & Eggs',
          slug: 'dairy-eggs',
          children: [
            { name: 'Milk', slug: 'milk' },
            { name: 'Cheese', slug: 'cheese' },
            { name: 'Yogurt', slug: 'yogurt' },
            { name: 'Butter', slug: 'butter' },
            { name: 'Eggs', slug: 'eggs' },
          ],
        },
        {
          name: 'Beverages',
          slug: 'beverages',
          children: [
            { name: 'Water', slug: 'water' },
            { name: 'Juices', slug: 'juices' },
            { name: 'Soft Drinks', slug: 'soft-drinks' },
            { name: 'Tea & Coffee', slug: 'tea-coffee' },
          ],
        },
        {
          name: 'Bakery',
          slug: 'bakery',
          children: [
            { name: 'Bread', slug: 'bread' },
            { name: 'Pastries', slug: 'pastries' },
            { name: 'Cakes', slug: 'cakes' },
            { name: 'Cookies', slug: 'cookies' },
          ],
        },
        {
          name: 'Meat & Poultry',
          slug: 'meat-poultry',
          children: [
            { name: 'Beef', slug: 'beef' },
            { name: 'Chicken', slug: 'chicken' },
            { name: 'Pork', slug: 'pork' },
            { name: 'Lamb', slug: 'lamb' },
          ],
        },
        {
          name: 'Seafood',
          slug: 'seafood',
          children: [
            { name: 'Fish', slug: 'fish' },
            { name: 'Shrimp', slug: 'shrimp' },
            { name: 'Shellfish', slug: 'shellfish' },
            { name: 'Crab & Lobster', slug: 'crab-lobster' },
          ],
        },
      ];

      // Process categories in parallel for better performance
      await Promise.all(
        categories.map(async (category) => {
          const parent = await transactionalEntityManager.save(
            categoryRepository.create({
              name: category.name,
              slug: category.slug,
            })
          );

          if (category.children?.length) {
            const children = category.children.map((child) =>
              categoryRepository.create({
                name: child.name,
                slug: child.slug,
                parentId: parent.id,
              })
            );
            await transactionalEntityManager.save(children);
          }
        })
      );

      // Add flat categories without children in a single batch
      const flatCategories = [
        { name: 'Frozen Foods', slug: 'frozen-foods' },
        { name: 'Canned Goods', slug: 'canned-goods' },
        { name: 'Snacks', slug: 'snacks' },
        { name: 'Pasta & Rice', slug: 'pasta-rice' },
        { name: 'Cereals', slug: 'cereals' },
        { name: 'Spices & Seasonings', slug: 'spices-seasonings' },
      ];

      await transactionalEntityManager.save(
        categoryRepository.create(flatCategories)
      );
    });
  }
}