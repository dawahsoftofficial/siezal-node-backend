import { MigrationInterface, QueryRunner } from "typeorm";

export class DefaultShippingValue1755667625506 implements MigrationInterface {
    name = 'DefaultShippingValue1755667625506'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`shipping_address_line2\` \`shipping_address_line2\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`shipping_address_line2\` \`shipping_address_line2\` varchar(255) NOT NULL`);
    }

}
