import { MigrationInterface, QueryRunner } from "typeorm";

export class UserTable1753107404507 implements MigrationInterface {
    name = 'UserTable1753107404507'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`users\` (\`id\` int NOT NULL AUTO_INCREMENT, \`created_at\` datetime NOT NULL, \`updated_at\` datetime NOT NULL, \`first_name\` varchar(100) NULL, \`last_name\` varchar(100) NULL, \`email\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`audit_logs\` DROP COLUMN \`stacktrace\``);
        await queryRunner.query(`ALTER TABLE \`audit_logs\` ADD \`stacktrace\` json NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`audit_logs\` DROP COLUMN \`stacktrace\``);
        await queryRunner.query(`ALTER TABLE \`audit_logs\` ADD \`stacktrace\` longtext COLLATE "utf8mb4_bin" NULL DEFAULT 'NULL'`);
        await queryRunner.query(`DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\``);
        await queryRunner.query(`DROP TABLE \`users\``);
    }

}
