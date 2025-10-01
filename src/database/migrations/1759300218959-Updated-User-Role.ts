import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatedUserRole1759300218959 implements MigrationInterface {
    name = 'UpdatedUserRole1759300218959'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`role\` \`role\` enum ('admin', 'user', 'manager', 'order_manager') NOT NULL DEFAULT 'user'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`role\` \`role\` enum ('admin', 'user', 'product_manager', 'order_manager') NOT NULL DEFAULT 'user'`);
    }

}
