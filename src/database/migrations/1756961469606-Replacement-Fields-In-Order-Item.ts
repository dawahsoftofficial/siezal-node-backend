import { MigrationInterface, QueryRunner } from "typeorm";

export class ReplacementFieldsInOrderItem1756961469606 implements MigrationInterface {
    name = 'ReplacementFieldsInOrderItem1756961469606'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`order_items\` ADD \`replacement_status\` enum ('0', '1', '2') NULL`);
        await queryRunner.query(`ALTER TABLE \`order_items\` ADD \`suggested_products\` json NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`long_lat\` \`long_lat\` varchar(100) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`long_lat\` \`long_lat\` varchar(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`order_items\` DROP COLUMN \`suggested_products\``);
        await queryRunner.query(`ALTER TABLE \`order_items\` DROP COLUMN \`replacement_status\``);
    }

}
