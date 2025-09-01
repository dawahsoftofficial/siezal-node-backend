import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterUserCreateUserSession1756757314760
  implements MigrationInterface
{
  name = "AlterUserCreateUserSession1756757314760";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`user_sessions\` (\`session_id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`user_id\` int NOT NULL, \`refresh_token\` text NOT NULL, \`expires_at\` datetime NOT NULL, PRIMARY KEY (\`session_id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` DROP COLUMN \`refresh_token\``
    );

    await queryRunner.query(
      `ALTER TABLE \`user_sessions\` ADD CONSTRAINT \`FK_e9658e959c490b0a634dfc54783\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user_sessions\` DROP FOREIGN KEY \`FK_e9658e959c490b0a634dfc54783\``
    );

    await queryRunner.query(
      `ALTER TABLE \`users\` ADD \`refresh_token\` text COLLATE "utf8mb4_unicode_ci" NULL DEFAULT ''NULL''`
    );

    await queryRunner.query(`DROP TABLE \`user_sessions\``);
  }
}
