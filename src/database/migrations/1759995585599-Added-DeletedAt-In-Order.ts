import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedDeletedAtInOrder1759995585599 implements MigrationInterface {
    name = 'AddedDeletedAtInOrder1759995585599'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`deleted_at\` \`deleted_at\` timestamp(6) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`deleted_at\` \`deleted_at\` timestamp(0) NULL`);
    }

}
