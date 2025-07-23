import { MigrationInterface, QueryRunner } from "typeorm";

export class Table1753107368047 implements MigrationInterface {
    name = 'Table1753107368047'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`audit_logs\` (\`id\` int NOT NULL AUTO_INCREMENT, \`created_at\` datetime NOT NULL, \`updated_at\` datetime NOT NULL, \`level\` enum ('info', 'warn', 'error', 'debug') NOT NULL DEFAULT 'error', \`type\` enum ('database', 'general', 'api_request_response') NOT NULL DEFAULT 'general', \`message\` text NOT NULL, \`stacktrace\` json NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`audit_logs\``);
    }

}
