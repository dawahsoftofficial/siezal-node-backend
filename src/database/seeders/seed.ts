import { AppDataSource } from "src/core/data-source/app.data-source";
import { UserSeeder } from "./user.seeder";
import CategorySeeder from "./category.seeder";
import ProductSeeder from "./product.seeder";
import AttributeSeeder from "./attribute.seeder";
import ProductAttributePivotSeeder from "./product-attributes.seeder";
import { InventorySeeder } from "./inventory.seeder";

(async () => {
  try {
    await AppDataSource.initialize();
    console.log("📦 DataSource initialized");

    await UserSeeder.run(AppDataSource);
    await CategorySeeder.run(AppDataSource);
    await InventorySeeder.run(AppDataSource);
    await ProductSeeder.run(AppDataSource);
    await AttributeSeeder.run(AppDataSource);
    await ProductAttributePivotSeeder.run(AppDataSource);

    console.log("✅ Seeders executed successfully");

    await AppDataSource.destroy();
    console.log("🌱 Seeding completed and connection closed");
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
})();
