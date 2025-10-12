import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedDeletedAtInOrder1759995437339 implements MigrationInterface {
    name = 'AddedDeletedAtInOrder1759995437339'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`deleted_at\` timestamp NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`deleted_at\``);
    }

}
