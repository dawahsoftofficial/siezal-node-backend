import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveLinkedFromProductImages1766500000000 implements MigrationInterface {
    name = 'RemoveLinkedFromProductImages1766500000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const hasLinked = await queryRunner.hasColumn("product_images", "linked");

        if (hasLinked) {
            await queryRunner.query(`ALTER TABLE \`product_images\` DROP COLUMN \`linked\``);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const hasLinked = await queryRunner.hasColumn("product_images", "linked");

        if (!hasLinked) {
            await queryRunner.query(`ALTER TABLE \`product_images\` ADD \`linked\` tinyint NOT NULL DEFAULT 0`);
        }
    }

}
