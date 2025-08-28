import { MigrationInterface, QueryRunner } from "typeorm";

export class ProductUnitNGst1755783203653 implements MigrationInterface {
    name = 'ProductUnitNGst1755783203653'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`products\` ADD \`unit\` enum ('piece', 'pack', 'box', 'dozen', 'gram', 'kilogram', 'ton', 'milliliter', 'liter', 'inch', 'foot', 'meter', 'centimeter') NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`products\` ADD \`is_gst_enabled\` tinyint NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`products\` DROP COLUMN \`is_gst_enabled\``);
        await queryRunner.query(`ALTER TABLE \`products\` DROP COLUMN \`unit\``);
    }

}
