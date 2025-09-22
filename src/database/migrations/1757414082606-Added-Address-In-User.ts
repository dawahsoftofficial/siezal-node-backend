import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedAddressInUser1757414082606 implements MigrationInterface {
    name = 'AddedAddressInUser1757414082606'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`shipping_address_line_1\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`shipping_address_line_2\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`shipping_postal_code\` varchar(20) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`shipping_city\` varchar(100) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`shipping_country\` varchar(100) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`shipping_state\` varchar(100) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`shipping_state\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`shipping_country\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`shipping_city\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`shipping_postal_code\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`shipping_address_line_2\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`shipping_address_line_1\``);
    }

}
