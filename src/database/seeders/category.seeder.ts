import { DataSource } from 'typeorm';
import { Category } from '../entities/category.entity';

type CategoryDefinition = {
  name: string;
  slug?: string;
  icon?: string;
  slideShow?: boolean;
  images?: string[];
  isFeatured?: boolean;
  position?: number;
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
          isFeatured: true,
          position: 1,
          children: [
            { name: 'Apples', icon: '/icons/apples.png', position: 1 },
            { name: 'Bananas', icon: '/icons/bananas.png', position: 2 },
            { name: 'Berries', icon: '/icons/berries.png', position: 3 },
            { name: 'Citrus', icon: '/icons/citrus.png', position: 4 },
            { name: 'Tropical', icon: '/icons/tropical.png', position: 5 },
          ],
        },
        {
          name: 'Vegetables',
          icon: '/icons/vegetables.png',
          slideShow: true,
          images: ['/banners/vegetables-banner.jpg'],
          isFeatured: true,
          position: 2,
          children: [
            { name: 'Leafy Greens', icon: '/icons/leafy-greens.png', position: 1 },
            { name: 'Root Vegetables', icon: '/icons/root-vegetables.png', position: 2 },
            { name: 'Tomatoes & Cucumbers', icon: '/icons/tomatoes-cucumbers.png', position: 3 },
            { name: 'Peppers', icon: '/icons/peppers.png', position: 4 },
            { name: 'Mushrooms', icon: '/icons/mushrooms.png', position: 5 },
          ],
        },
        {
          name: 'Dairy & Eggs',
          icon: '/icons/dairy-eggs.png',
          isFeatured: false,
          position: 3,
          children: [
            { name: 'Milk', icon: '/icons/milk.png', position: 1 },
            { name: 'Cheese', icon: '/icons/cheese.png', position: 2 },
            { name: 'Yogurt', icon: '/icons/yogurt.png', position: 3 },
            { name: 'Butter', icon: '/icons/butter.png', position: 4 },
            { name: 'Eggs', icon: '/icons/eggs.png', position: 5 },
          ],
        },
        {
          name: 'Beverages',
          icon: '/icons/beverages.png',
          isFeatured: true,
          position: 4,
          children: [
            { name: 'Water', icon: '/icons/water.png', position: 1 },
            { name: 'Juices', icon: '/icons/juices.png', position: 2 },
            { name: 'Soft Drinks', icon: '/icons/soft-drinks.png', position: 3 },
            { name: 'Tea & Coffee', icon: '/icons/tea-coffee.png', position: 4 },
          ],
        },
        {
          name: 'Bakery',
          icon: '/icons/bakery.png',
          isFeatured: false,
          position: 5,
          children: [
            { name: 'Bread', icon: '/icons/bread.png', position: 1 },
            { name: 'Pastries', icon: '/icons/pastries.png', position: 2 },
            { name: 'Cakes', icon: '/icons/cakes.png', position: 3 },
            { name: 'Cookies', icon: '/icons/cookies.png', position: 4 },
          ],
        },
        {
          name: 'Meat & Poultry',
          icon: '/icons/meat-poultry.png',
          isFeatured: true,
          position: 6,
          children: [
            { name: 'Beef', icon: '/icons/beef.png', position: 1 },
            { name: 'Chicken', icon: '/icons/chicken.png', position: 2 },
            { name: 'Pork', icon: '/icons/pork.png', position: 3 },
            { name: 'Lamb', icon: '/icons/lamb.png', position: 4 },
          ],
        },
        {
          name: 'Seafood',
          icon: '/icons/seafood.png',
          isFeatured: false,
          position: 7,
          children: [
            { name: 'Fish', icon: '/icons/fish.png', position: 1 },
            { name: 'Shrimp', icon: '/icons/shrimp.png', position: 2 },
            { name: 'Shellfish', icon: '/icons/shellfish.png', position: 3 },
            { name: 'Crab & Lobster', icon: '/icons/crab-lobster.png', position: 4 },
          ],
        },
      ];

      const flatCategories: CategoryDefinition[] = [
        { name: 'Frozen Foods', icon: '/icons/frozen-foods.png', isFeatured: false, position: 8 },
        { name: 'Canned Goods', icon: '/icons/canned-goods.png', isFeatured: false, position: 9 },
        { name: 'Snacks', icon: '/icons/snacks.png', isFeatured: true, position: 10 },
        { name: 'Pasta & Rice', icon: '/icons/pasta-rice.png', isFeatured: false, position: 11 },
        { name: 'Cereals', icon: '/icons/cereals.png', isFeatured: false, position: 12 },
        { name: 'Spices & Seasonings', icon: '/icons/spices-seasonings.png', isFeatured: true, position: 13 },
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
            isFeatured: def.isFeatured ?? false,
            position: def.position ?? 0,
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
