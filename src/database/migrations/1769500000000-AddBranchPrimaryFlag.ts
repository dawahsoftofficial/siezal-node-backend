import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBranchPrimaryFlag1769500000000 implements MigrationInterface {
  name = "AddBranchPrimaryFlag1769500000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `branches` ADD `is_primary` tinyint NOT NULL DEFAULT 0"
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("ALTER TABLE `branches` DROP COLUMN `is_primary`");
  }
}
