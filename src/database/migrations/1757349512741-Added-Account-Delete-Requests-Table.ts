import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedAccountDeleteRequestsTable1757349512741 implements MigrationInterface {
    name = 'AddedAccountDeleteRequestsTable1757349512741'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`delete_account_requests\` (\`id\` int NOT NULL AUTO_INCREMENT, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`first_name\` varchar(100) NOT NULL, \`last_name\` varchar(100) NOT NULL, \`email\` varchar(150) NOT NULL, \`phone\` varchar(20) NULL, \`purpose\` text NULL, \`comments\` text NULL, \`status\` enum ('pending', 'processed', 'rejected') NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`fcm_tokens\` DROP FOREIGN KEY \`FK_c09908569278b476f9923b49fb4\``);
        await queryRunner.query(`ALTER TABLE \`fcm_tokens\` DROP COLUMN \`user_session_id\``);
        await queryRunner.query(`ALTER TABLE \`fcm_tokens\` ADD \`user_session_id\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`fcm_tokens\` ADD CONSTRAINT \`FK_c09908569278b476f9923b49fb4\` FOREIGN KEY (\`user_session_id\`) REFERENCES \`user_sessions\`(\`session_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`fcm_tokens\` DROP FOREIGN KEY \`FK_c09908569278b476f9923b49fb4\``);
        await queryRunner.query(`ALTER TABLE \`fcm_tokens\` DROP COLUMN \`user_session_id\``);
        await queryRunner.query(`ALTER TABLE \`fcm_tokens\` ADD \`user_session_id\` varchar(36) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`fcm_tokens\` ADD CONSTRAINT \`FK_c09908569278b476f9923b49fb4\` FOREIGN KEY (\`user_session_id\`) REFERENCES \`user_sessions\`(\`session_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`DROP TABLE \`delete_account_requests\``);
    }

}
