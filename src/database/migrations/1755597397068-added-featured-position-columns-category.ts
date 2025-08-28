import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedFeaturedPositionColumnsCategory1755597397068 implements MigrationInterface {
    name = 'AddedFeaturedPositionColumnsCategory1755597397068'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`categories\` ADD \`is_featured\` tinyint NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`categories\` ADD \`position\` int NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`categories\` DROP COLUMN \`position\``);
        await queryRunner.query(`ALTER TABLE \`categories\` DROP COLUMN \`is_featured\``);
    }

}
