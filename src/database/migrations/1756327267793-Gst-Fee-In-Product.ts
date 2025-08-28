import { MigrationInterface, QueryRunner } from "typeorm";

export class GstFeeInProduct1756327267793 implements MigrationInterface {
    name = 'GstFeeInProduct1756327267793'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`products\` ADD \`gst_fee\` decimal(10,2) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`products\` DROP COLUMN \`gst_fee\``);
    }

}
