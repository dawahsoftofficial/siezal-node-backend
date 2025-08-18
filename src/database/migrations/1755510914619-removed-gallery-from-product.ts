import { MigrationInterface, QueryRunner } from "typeorm";

export class RemovedGalleryFromProduct1755510914619 implements MigrationInterface {
    name = 'RemovedGalleryFromProduct1755510914619'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`products\` DROP COLUMN \`gallery\``);
        await queryRunner.query(`ALTER TABLE \`products\` CHANGE \`image\` \`image\` varchar(1000) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`products\` CHANGE \`image\` \`image\` varchar(1000) NULL`);
        await queryRunner.query(`ALTER TABLE \`products\` ADD \`gallery\` json NULL`);
    }

}
