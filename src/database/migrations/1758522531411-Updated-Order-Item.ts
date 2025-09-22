import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatedOrderItem1758522531411 implements MigrationInterface {
    name = 'UpdatedOrderItem1758522531411'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`history\``);
        await queryRunner.query(`ALTER TABLE \`order_items\` ADD \`timestamp\` bigint NULL`);
        await queryRunner.query(`ALTER TABLE \`order_items\` ADD \`history\` json NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`order_items\` DROP COLUMN \`history\``);
        await queryRunner.query(`ALTER TABLE \`order_items\` DROP COLUMN \`timestamp\``);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`history\` json NULL`);
    }

}
