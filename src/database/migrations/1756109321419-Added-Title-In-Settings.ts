import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedTitleInSettings1756109321419 implements MigrationInterface {
    name = 'AddedTitleInSettings1756109321419'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`settings\` ADD \`title\` varchar(100) NOT NULL DEFAULT 'General'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`settings\` DROP COLUMN \`title\``);
    }

}
