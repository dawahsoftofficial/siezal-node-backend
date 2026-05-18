import { MigrationInterface, QueryRunner } from "typeorm";

export class AddImportedNewFieldInProduct1779148800000 implements MigrationInterface {
    name = 'AddImportedNewFieldInProduct1779148800000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`products\` ADD \`imported_new\` tinyint NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`products\` DROP COLUMN \`imported_new\``);
    }
}
