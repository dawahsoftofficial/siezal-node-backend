import { MigrationInterface, QueryRunner } from "typeorm";

export class OrderStatusUpdate1756728835033 implements MigrationInterface {
    name = 'OrderStatusUpdate1756728835033'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`status\` \`status\` enum ('new', 'in_review', 'preparing', 'pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled', 'refunded') NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`audit_logs\` CHANGE \`type\` \`type\` enum ('database', 'general', 'api_request_response', 'otp') NOT NULL DEFAULT 'general'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`audit_logs\` CHANGE \`type\` \`type\` enum ('database', 'general', 'api_request_response') NOT NULL DEFAULT 'general'`);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`status\` \`status\` enum ('new', 'refunded', 'pending', 'processing', 'shipped', 'delivered', 'cancelled') NOT NULL`);
    }

}
