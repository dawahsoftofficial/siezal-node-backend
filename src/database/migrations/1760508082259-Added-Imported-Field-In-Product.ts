import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedImportedFieldInProduct1760508082259 implements MigrationInterface {
    name = 'AddedImportedFieldInProduct1760508082259'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // await queryRunner.query(`ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_9de1349a64a7c4bae541516f96d\``);
        // await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`payment_session_id\``);
        await queryRunner.query(`ALTER TABLE \`products\` ADD \`imported\` tinyint NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`products\` DROP COLUMN \`imported\``);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`payment_session_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_9de1349a64a7c4bae541516f96d\` FOREIGN KEY (\`payment_session_id\`) REFERENCES \`payment_sessions\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

}
