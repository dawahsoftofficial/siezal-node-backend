import { MigrationInterface, QueryRunner } from "typeorm";

export class BannedColumnInUser1756285003862 implements MigrationInterface {
    name = 'BannedColumnInUser1756285003862'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`is_banned\` tinyint NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`is_banned\``);
    }

}
