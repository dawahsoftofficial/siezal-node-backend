import { MigrationInterface, QueryRunner } from "typeorm";

export class OrderStatusNLongLatUpdate1756728287918 implements MigrationInterface {
    name = 'OrderStatusNLongLatUpdate1756728287918'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`long_lat\` varchar(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`audit_logs\` CHANGE \`type\` \`type\` enum ('database', 'general', 'api_request_response', 'otp') NOT NULL DEFAULT 'general'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`audit_logs\` CHANGE \`type\` \`type\` enum ('database', 'general', 'api_request_response') NOT NULL DEFAULT 'general'`);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`long_lat\``);
    }

}
