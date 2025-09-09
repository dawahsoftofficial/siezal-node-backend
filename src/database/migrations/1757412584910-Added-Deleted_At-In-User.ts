import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedDeletedAtInUser1757412584910 implements MigrationInterface {
    name = 'AddedDeletedAtInUser1757412584910'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`deleted_at\` timestamp(6) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`deleted_at\``);
    }

}
