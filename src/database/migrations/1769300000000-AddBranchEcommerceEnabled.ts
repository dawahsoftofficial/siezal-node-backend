import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBranchEcommerceEnabled1769300000000
  implements MigrationInterface
{
  name = "AddBranchEcommerceEnabled1769300000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `branches` ADD `is_ecommerce_enabled` tinyint NOT NULL DEFAULT 1",
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `branches` DROP COLUMN `is_ecommerce_enabled`",
    );
  }
}
