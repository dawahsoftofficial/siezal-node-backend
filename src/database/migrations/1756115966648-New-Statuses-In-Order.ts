import { MigrationInterface, QueryRunner } from "typeorm";

export class NewStatusesInOrder1756115966648 implements MigrationInterface {
    name = 'NewStatusesInOrder1756115966648'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`status\` \`status\` enum ('new', 'refunded', 'pending', 'processing', 'shipped', 'delivered', 'cancelled') NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`status\` \`status\` enum ('pending', 'processing', 'shipped', 'delivered', 'cancelled') NOT NULL`);
    }

}
