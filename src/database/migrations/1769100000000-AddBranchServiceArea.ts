import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBranchServiceArea1769100000000
  implements MigrationInterface
{
  name = "AddBranchServiceArea1769100000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `branches` ADD `service_area` json NULL",
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `branches` DROP COLUMN `service_area`",
    );
  }
}
