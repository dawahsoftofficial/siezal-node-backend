import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedCategoryStatus1763471814215 implements MigrationInterface {
    name = 'AddedCategoryStatus1763471814215'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`categories\` ADD \`status\` enum ('Published', 'Draft') NOT NULL DEFAULT 'Published'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`categories\` DROP COLUMN \`status\``);
    }

}
