import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateVendorsTables1761885600000 implements MigrationInterface {
  name = "CreateVendorsTables1761885600000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "CREATE TABLE `vendors` (`id` int NOT NULL AUTO_INCREMENT, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `name` varchar(150) NOT NULL, `code` varchar(100) NOT NULL, `contact_name` varchar(150) NULL, `contact_email` varchar(255) NULL, `client_id` varchar(255) NULL, `client_secret_hash` varchar(255) NULL, `is_active` tinyint NOT NULL DEFAULT 1, `last_login_at` datetime NULL, UNIQUE INDEX `IDX_vendor_code` (`code`), UNIQUE INDEX `IDX_vendor_client_id` (`client_id`), PRIMARY KEY (`id`)) ENGINE=InnoDB",
    );
    await queryRunner.query(
      "CREATE TABLE `vendor_logs` (`id` int NOT NULL AUTO_INCREMENT, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `vendor_id` int NOT NULL, `type` varchar(100) NOT NULL, `endpoint` varchar(255) NOT NULL, `method` varchar(20) NOT NULL, `request_payload` json NULL, `response_payload` json NULL, `status_code` int NOT NULL, `success` tinyint NOT NULL DEFAULT 0, `error_message` text NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB",
    );
    await queryRunner.query(
      "ALTER TABLE `vendor_logs` ADD CONSTRAINT `FK_vendor_logs_vendor_id` FOREIGN KEY (`vendor_id`) REFERENCES `vendors`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION",
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `vendor_logs` DROP FOREIGN KEY `FK_vendor_logs_vendor_id`",
    );
    await queryRunner.query("DROP TABLE `vendor_logs`");
    await queryRunner.query("DROP INDEX `IDX_vendor_client_id` ON `vendors`");
    await queryRunner.query("DROP INDEX `IDX_vendor_code` ON `vendors`");
    await queryRunner.query("DROP TABLE `vendors`");
  }
}
