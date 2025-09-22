import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedAddressTable1757560010998 implements MigrationInterface {
    name = 'AddedAddressTable1757560010998'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`addresses\` (\`id\` int NOT NULL AUTO_INCREMENT, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`user_id\` int NOT NULL, \`shipping_address_line_1\` varchar(255) NOT NULL, \`shipping_address_line_2\` varchar(255) NULL, \`shipping_postal_code\` varchar(20) NOT NULL, \`shipping_city\` varchar(100) NOT NULL, \`shipping_country\` varchar(100) NOT NULL, \`shipping_state\` varchar(100) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`addresses\` ADD CONSTRAINT \`FK_16aac8a9f6f9c1dd6bcb75ec023\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`addresses\` DROP FOREIGN KEY \`FK_16aac8a9f6f9c1dd6bcb75ec023\``);
        await queryRunner.query(`DROP TABLE \`addresses\``);
    }
}
