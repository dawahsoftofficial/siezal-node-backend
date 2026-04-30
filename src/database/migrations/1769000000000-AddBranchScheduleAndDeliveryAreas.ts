import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBranchScheduleAndDeliveryAreas1769000000000
  implements MigrationInterface
{
  name = "AddBranchScheduleAndDeliveryAreas1769000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `branches` ADD `weekly_schedule` json NULL",
    );
    await queryRunner.query(
      "ALTER TABLE `branches` ADD `delivery_areas` json NULL",
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `branches` DROP COLUMN `delivery_areas`",
    );
    await queryRunner.query(
      "ALTER TABLE `branches` DROP COLUMN `weekly_schedule`",
    );
  }
}
