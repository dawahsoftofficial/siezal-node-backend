import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterOrderWithGatewayAndDeviceType1762193997745 implements MigrationInterface {
    name = 'AlterOrderWithGatewayAndDeviceType1762193997745'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`gateway\` enum ('meezan', 'easypaisa', 'cod') NOT NULL DEFAULT 'cod'`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`deviceType\` enum ('android', 'ios', 'web') NOT NULL DEFAULT 'web'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`deviceType\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`gateway\``);
    }

}
