import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBranchIdToProducts1761878400000 implements MigrationInterface {
  name = "AddBranchIdToProducts1761878400000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `products` ADD `branch_id` int NULL",
    );
    await queryRunner.query(
      "ALTER TABLE `products` ADD CONSTRAINT `FK_products_branch_id` FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION",
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `products` DROP FOREIGN KEY `FK_products_branch_id`",
    );
    await queryRunner.query(
      "ALTER TABLE `products` DROP COLUMN `branch_id`",
    );
  }
}
