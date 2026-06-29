import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateVendorProductAudits1781222400000
  implements MigrationInterface
{
  name = "CreateVendorProductAudits1781222400000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "CREATE TABLE `vendor_product_audits` (`id` int NOT NULL AUTO_INCREMENT, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `product_id` int NULL, `product_reference_id` int NOT NULL, `vendor_id` int NULL, `vendor_log_id` int NULL, `branch_id` int NULL, `branch_reference_id` int NOT NULL, `vendor_code` varchar(100) NOT NULL, `sku` varchar(255) NOT NULL, `action` varchar(20) NOT NULL, `changed_fields` json NOT NULL, `before_snapshot` json NULL, `after_snapshot` json NOT NULL, `request_payload` json NOT NULL, INDEX `IDX_vendor_product_audits_product_created` (`product_reference_id`, `created_at`), INDEX `IDX_vendor_product_audits_vendor_created` (`vendor_id`, `created_at`), INDEX `IDX_vendor_product_audits_branch_sku` (`branch_reference_id`, `sku`), PRIMARY KEY (`id`)) ENGINE=InnoDB",
    );
    await queryRunner.query(
      "ALTER TABLE `vendor_product_audits` ADD CONSTRAINT `FK_vendor_product_audits_product_id` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION",
    );
    await queryRunner.query(
      "ALTER TABLE `vendor_product_audits` ADD CONSTRAINT `FK_vendor_product_audits_vendor_id` FOREIGN KEY (`vendor_id`) REFERENCES `vendors`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION",
    );
    await queryRunner.query(
      "ALTER TABLE `vendor_product_audits` ADD CONSTRAINT `FK_vendor_product_audits_vendor_log_id` FOREIGN KEY (`vendor_log_id`) REFERENCES `vendor_logs`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION",
    );
    await queryRunner.query(
      "ALTER TABLE `vendor_product_audits` ADD CONSTRAINT `FK_vendor_product_audits_branch_id` FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION",
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `vendor_product_audits` DROP FOREIGN KEY `FK_vendor_product_audits_branch_id`",
    );
    await queryRunner.query(
      "ALTER TABLE `vendor_product_audits` DROP FOREIGN KEY `FK_vendor_product_audits_vendor_log_id`",
    );
    await queryRunner.query(
      "ALTER TABLE `vendor_product_audits` DROP FOREIGN KEY `FK_vendor_product_audits_vendor_id`",
    );
    await queryRunner.query(
      "ALTER TABLE `vendor_product_audits` DROP FOREIGN KEY `FK_vendor_product_audits_product_id`",
    );
    await queryRunner.query("DROP TABLE `vendor_product_audits`");
  }
}
