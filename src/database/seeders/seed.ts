import { AppDataSource } from 'src/core/data-source/app.data-source';
import { UserSeeder } from './user.seeder';
import CategorySeeder from './category.seeder';

(async () => {
  try {
    await AppDataSource.initialize();
    console.log('📦 DataSource initialized');

    // await UserSeeder.run(AppDataSource);
    await CategorySeeder.run(AppDataSource);
    console.log('✅ User seeder executed successfully');

    await AppDataSource.destroy();
    console.log('🌱 Seeding completed and connection closed');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
})();