import { MigrationInterface, QueryRunner } from "typeorm";

export class OrderStatusUpdate1756729182554 implements MigrationInterface {
    name = 'OrderStatusUpdate1756729182554'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`status\` \`status\` enum ('new', 'in_review', 'preparing', 'shipped', 'delivered', 'completed', 'cancelled', 'refunded') NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`status\` \`status\` enum ('new', 'in_review', 'preparing', 'pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled', 'refunded') NOT NULL`);
    }

}
