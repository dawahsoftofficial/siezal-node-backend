import { MigrationInterface, QueryRunner } from "typeorm";

export class TotalDiscountAmountOrderAndTotalGstFeeInOrderItem1756339002284
  implements MigrationInterface
{
  name = "TotalDiscountAmountOrderAndTotalGstFeeInOrderItem1756339002284";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`order_items\` ADD \`total_gst_amount\` decimal(10,2) NULL`
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD \`total_discount_amount\` decimal(10,2) NULL COMMENT 'Total discount if discount enable from setting'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`orders\` DROP COLUMN \`total_discount_amount\``
    );
    await queryRunner.query(
      `ALTER TABLE \`order_items\` DROP COLUMN \`total_gst_amount\``
    );
  }
}
