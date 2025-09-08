import { MigrationInterface, QueryRunner } from "typeorm";

export class HistoryColumnInOrder1756881718307 implements MigrationInterface {
    name = 'HistoryColumnInOrder1756881718307'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`history\` json NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`history\``);
    }

}
