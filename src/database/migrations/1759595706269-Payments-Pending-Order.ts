import { MigrationInterface, QueryRunner } from "typeorm";

export class PaymentsPendingOrder1759595706269 implements MigrationInterface {
    name = 'PaymentsPendingOrder1759595706269'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`payment_sessions\` (\`id\` int NOT NULL AUTO_INCREMENT, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`pending_order_id\` int NOT NULL, \`gateway\` enum ('meezan', 'easypaisa', 'cod') NOT NULL, \`gateway_order_id\` varchar(255) NULL, \`status\` enum ('PENDING', 'SUCCESS', 'FAILED', 'CANCELLED') NOT NULL DEFAULT 'PENDING', \`amount\` int NOT NULL, \`action_logs\` json NULL, \`raw_request\` json NULL, \`raw_response\` json NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`pending_orders\` (\`id\` int NOT NULL AUTO_INCREMENT, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`merchant_order_id\` varchar(255) NOT NULL, \`user_id\` int NOT NULL, \`dto\` json NOT NULL, \`status\` varchar(255) NOT NULL DEFAULT 'PENDING', UNIQUE INDEX \`IDX_5632b7208b663a702795e8b192\` (\`merchant_order_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`payment_session_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_9de1349a64a7c4bae541516f96d\` FOREIGN KEY (\`payment_session_id\`) REFERENCES \`payment_sessions\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`payment_sessions\` ADD CONSTRAINT \`FK_c194e7df07cede63a1e136d621d\` FOREIGN KEY (\`pending_order_id\`) REFERENCES \`pending_orders\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`pending_orders\` ADD CONSTRAINT \`FK_15df901f87b9da805e0b3cde8bf\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`pending_orders\` DROP FOREIGN KEY \`FK_15df901f87b9da805e0b3cde8bf\``);
        await queryRunner.query(`ALTER TABLE \`payment_sessions\` DROP FOREIGN KEY \`FK_c194e7df07cede63a1e136d621d\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_9de1349a64a7c4bae541516f96d\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`payment_session_id\``);
        await queryRunner.query(`DROP INDEX \`IDX_5632b7208b663a702795e8b192\` ON \`pending_orders\``);
        await queryRunner.query(`DROP TABLE \`pending_orders\``);
        await queryRunner.query(`DROP TABLE \`payment_sessions\``);
    }

}
