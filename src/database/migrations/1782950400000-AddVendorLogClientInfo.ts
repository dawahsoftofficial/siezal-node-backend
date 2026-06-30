import { MigrationInterface, QueryRunner } from "typeorm";

export class AddVendorLogClientInfo1782950400000 implements MigrationInterface {
  name = "AddVendorLogClientInfo1782950400000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `vendor_logs` ADD `ip` varchar(64) NULL",
    );
    await queryRunner.query(
      "ALTER TABLE `vendor_logs` ADD `user_agent` varchar(512) NULL",
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `vendor_logs` DROP COLUMN `user_agent`",
    );
    await queryRunner.query("ALTER TABLE `vendor_logs` DROP COLUMN `ip`");
  }
}
