import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterUserRefresh1753275622721 implements MigrationInterface {
    name = 'AlterUserRefresh1753275622721'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`refresh_token\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`first_name\` \`first_name\` varchar(100) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`last_name\` \`last_name\` varchar(100) NULL`);
        await queryRunner.query(`ALTER TABLE \`audit_logs\` DROP COLUMN \`stacktrace\``);
        await queryRunner.query(`ALTER TABLE \`audit_logs\` ADD \`stacktrace\` json NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`audit_logs\` DROP COLUMN \`stacktrace\``);
        await queryRunner.query(`ALTER TABLE \`audit_logs\` ADD \`stacktrace\` longtext COLLATE "utf8mb4_bin" NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`last_name\` \`last_name\` varchar(100) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`first_name\` \`first_name\` varchar(100) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`refresh_token\``);
    }

}
