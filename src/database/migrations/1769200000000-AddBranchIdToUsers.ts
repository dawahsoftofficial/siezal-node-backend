import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBranchIdToUsers1769200000000 implements MigrationInterface {
  name = "AddBranchIdToUsers1769200000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `users` ADD `branch_id` int NULL",
    );
    await queryRunner.query(
      "ALTER TABLE `users` ADD CONSTRAINT `FK_users_branch_id` FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION",
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `users` DROP FOREIGN KEY `FK_users_branch_id`",
    );
    await queryRunner.query(
      "ALTER TABLE `users` DROP COLUMN `branch_id`",
    );
  }
}
