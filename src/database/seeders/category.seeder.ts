import { DataSource } from 'typeorm';
import { Category } from '../entities/category.entity';

type CategoryDefinition = {
  name: string;
  slug?: string;
  icon?: string;
  slideShow?: boolean;
  images?: string[];
  children?: Omit<CategoryDefinition, 'children'>[];
};

export default class CategorySeeder {
  public static async run(dataSource: DataSource): Promise<void> {
    const categoryRepository = dataSource.getRepository(Category);

    await dataSource.transaction(async (transactionalEntityManager) => {
      // await transactionalEntityManager.clear(Category);

      const categories: CategoryDefinition[] = [
        {
          name: 'Fruits',
          icon: '/icons/fruits.png',
          slideShow: true,
          images: ['/banners/fruits-banner.jpg'],
          children: [
            { name: 'Apples', icon: '/icons/apples.png' },
            { name: 'Bananas', icon: '/icons/bananas.png' },
            { name: 'Berries', icon: '/icons/berries.png' },
            { name: 'Citrus', icon: '/icons/citrus.png' },
            { name: 'Tropical', icon: '/icons/tropical.png' },
          ],
        },
        {
          name: 'Vegetables',
          icon: '/icons/vegetables.png',
          slideShow: true,
          images: ['/banners/vegetables-banner.jpg'],
          children: [
            { name: 'Leafy Greens', icon: '/icons/leafy-greens.png' },
            { name: 'Root Vegetables', icon: '/icons/root-vegetables.png' },
            { name: 'Tomatoes & Cucumbers', icon: '/icons/tomatoes-cucumbers.png' },
            { name: 'Peppers', icon: '/icons/peppers.png' },
            { name: 'Mushrooms', icon: '/icons/mushrooms.png' },
          ],
        },
        {
          name: 'Dairy & Eggs',
          icon: '/icons/dairy-eggs.png',
          children: [
            { name: 'Milk', icon: '/icons/milk.png' },
            { name: 'Cheese', icon: '/icons/cheese.png' },
            { name: 'Yogurt', icon: '/icons/yogurt.png' },
            { name: 'Butter', icon: '/icons/butter.png' },
            { name: 'Eggs', icon: '/icons/eggs.png' },
          ],
        },
        {
          name: 'Beverages',
          icon: '/icons/beverages.png',
          children: [
            { name: 'Water', icon: '/icons/water.png' },
            { name: 'Juices', icon: '/icons/juices.png' },
            { name: 'Soft Drinks', icon: '/icons/soft-drinks.png' },
            { name: 'Tea & Coffee', icon: '/icons/tea-coffee.png' },
          ],
        },
        {
          name: 'Bakery',
          icon: '/icons/bakery.png',
          children: [
            { name: 'Bread', icon: '/icons/bread.png' },
            { name: 'Pastries', icon: '/icons/pastries.png' },
            { name: 'Cakes', icon: '/icons/cakes.png' },
            { name: 'Cookies', icon: '/icons/cookies.png' },
          ],
        },
        {
          name: 'Meat & Poultry',
          icon: '/icons/meat-poultry.png',
          children: [
            { name: 'Beef', icon: '/icons/beef.png' },
            { name: 'Chicken', icon: '/icons/chicken.png' },
            { name: 'Pork', icon: '/icons/pork.png' },
            { name: 'Lamb', icon: '/icons/lamb.png' },
          ],
        },
        {
          name: 'Seafood',
          icon: '/icons/seafood.png',
          children: [
            { name: 'Fish', icon: '/icons/fish.png' },
            { name: 'Shrimp', icon: '/icons/shrimp.png' },
            { name: 'Shellfish', icon: '/icons/shellfish.png' },
            { name: 'Crab & Lobster', icon: '/icons/crab-lobster.png' },
          ],
        },
      ];

      const flatCategories: CategoryDefinition[] = [
        { name: 'Frozen Foods', icon: '/icons/frozen-foods.png' },
        { name: 'Canned Goods', icon: '/icons/canned-goods.png' },
        { name: 'Snacks', icon: '/icons/snacks.png' },
        { name: 'Pasta & Rice', icon: '/icons/pasta-rice.png' },
        { name: 'Cereals', icon: '/icons/cereals.png' },
        { name: 'Spices & Seasonings', icon: '/icons/spices-seasonings.png' },
      ];

      const makeSlug = (name: string) =>
        name.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

      const saveCategoryTree = async (defs: CategoryDefinition[], parentId?: number) => {
        for (const def of defs) {
          const category = categoryRepository.create({
            name: def.name,
            slug: def.slug || makeSlug(def.name),
            icon: def.icon || '',
            slideShow: def.slideShow ?? false,
            images: def.images || [],
            parentId: parentId ?? undefined,
          });

          const saved = await transactionalEntityManager.save(category);
          if (def.children?.length) {
            await saveCategoryTree(def.children, saved.id);
          }
        }
      };

      await saveCategoryTree(categories);
      await saveCategoryTree(flatCategories);
    });
  }
}
