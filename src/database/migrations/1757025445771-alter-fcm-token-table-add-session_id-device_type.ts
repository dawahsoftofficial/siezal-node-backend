import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterFcmTokenTableAddSessionIdDeviceType1757025445771
  implements MigrationInterface
{
  name = "AlterFcmTokenTableAddSessionIdDeviceType1757025445771";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`fcm_tokens\` ADD \`user_session_id\` varchar(36) NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE \`fcm_tokens\` ADD \`device_type\` enum ('android', 'ios', 'web') NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE \`fcm_tokens\` ADD CONSTRAINT \`FK_c09908569278b476f9923b49fb4\` FOREIGN KEY (\`user_session_id\`) REFERENCES \`user_sessions\`(\`session_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`fcm_tokens\` DROP FOREIGN KEY \`FK_c09908569278b476f9923b49fb4\``
    );
    await queryRunner.query(
      `ALTER TABLE \`fcm_tokens\` DROP COLUMN \`device_type\``
    );
    await queryRunner.query(
      `ALTER TABLE \`fcm_tokens\` DROP COLUMN \`user_session_id\``
    );
  }
}
