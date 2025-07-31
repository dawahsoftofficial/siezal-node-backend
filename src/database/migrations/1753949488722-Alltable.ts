import { MigrationInterface, QueryRunner } from "typeorm";

export class Alltable1753949488722 implements MigrationInterface {
    name = 'Alltable1753949488722'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`users\` (\`id\` int NOT NULL AUTO_INCREMENT, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`first_name\` varchar(100) NULL, \`last_name\` varchar(100) NULL, \`email\` varchar(255) NULL, \`phone\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`role\` enum ('admin', 'user', 'product_manager', 'order_manager') NOT NULL DEFAULT 'user', \`verified_at\` timestamp NULL, \`refresh_token\` text NULL, \`google_id\` varchar(255) NULL, \`otp\` varchar(255) NULL, \`otp_expires_at\` timestamp NULL, UNIQUE INDEX \`IDX_a000cca60bcf04454e72769949\` (\`phone\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`settings\` (\`id\` int NOT NULL AUTO_INCREMENT, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`key\` varchar(100) NOT NULL, \`value\` text NOT NULL, \`type\` enum ('string', 'number', 'boolean', 'json') NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`products\` (\`id\` int NOT NULL AUTO_INCREMENT, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`sku\` varchar(100) NULL, \`title\` varchar(255) NOT NULL, \`slug\` varchar(255) NOT NULL, \`short_description\` text NULL, \`description\` text NULL, \`seo_title\` varchar(255) NULL, \`seo_description\` text NULL, \`price\` decimal(10,2) NOT NULL, \`sale_price\` decimal(10,2) NULL, \`stock_quantity\` int NOT NULL, \`status\` enum ('available', 'out_of_stock', 'discontinued') NOT NULL, \`category_id\` int NOT NULL, \`image\` varchar(1000) NULL, \`gallery\` json NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`attributes\` (\`id\` int NOT NULL AUTO_INCREMENT, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`name\` varchar(255) NOT NULL, \`slug\` varchar(255) NOT NULL, \`parent_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`product_attributes\` (\`id\` int NOT NULL AUTO_INCREMENT, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`product_id\` int NOT NULL, \`attribute_id\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`orders\` (\`id\` int NOT NULL AUTO_INCREMENT, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`order_uid\` varchar(100) NOT NULL, \`user_full_name\` varchar(255) NOT NULL, \`user_phone\` varchar(20) NOT NULL, \`user_email\` varchar(255) NULL, \`shipping_address_line1\` varchar(255) NOT NULL, \`shipping_address_line2\` varchar(255) NOT NULL, \`shipping_city\` varchar(100) NOT NULL, \`shipping_state\` varchar(100) NULL, \`shipping_country\` varchar(100) NOT NULL, \`shipping_postal_code\` varchar(20) NOT NULL, \`gst_amount\` decimal(10,2) NOT NULL, \`shipping_amount\` decimal(10,2) NOT NULL, \`total_amount\` decimal(10,2) NOT NULL, \`status\` enum ('pending', 'processing', 'shipped', 'delivered', 'cancelled') NOT NULL, UNIQUE INDEX \`IDX_563d34322942aeff0ca2a4b472\` (\`order_uid\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`order_items\` (\`id\` int NOT NULL AUTO_INCREMENT, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`order_id\` int NOT NULL, \`product_id\` int NOT NULL, \`quantity\` int NOT NULL, \`total_price\` decimal(10,2) NOT NULL, \`product_data\` json NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`fcm_tokens\` (\`id\` int NOT NULL AUTO_INCREMENT, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`user_id\` int NOT NULL, \`token\` text NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`inventory\` (\`id\` int NOT NULL AUTO_INCREMENT, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`longitude\` double NOT NULL, \`latitude\` double NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`categories\` (\`id\` int NOT NULL AUTO_INCREMENT, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`name\` varchar(255) NOT NULL, \`slug\` varchar(255) NOT NULL, \`parent_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`notifications\` (\`id\` int NOT NULL AUTO_INCREMENT, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`user_ids\` json NULL, \`title\` varchar(255) NOT NULL, \`message\` text NOT NULL, \`read\` tinyint NOT NULL DEFAULT 0, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`audit_logs\` (\`id\` int NOT NULL AUTO_INCREMENT, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`level\` enum ('info', 'warn', 'error', 'debug') NOT NULL DEFAULT 'error', \`type\` enum ('database', 'general', 'api_request_response') NOT NULL DEFAULT 'general', \`message\` text NOT NULL, \`stacktrace\` json NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`attributes\` ADD CONSTRAINT \`FK_0702649871193d82dcd49ee358d\` FOREIGN KEY (\`parent_id\`) REFERENCES \`attributes\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`product_attributes\` ADD CONSTRAINT \`FK_f5a6700abd0494bae3032cf5bbd\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`product_attributes\` ADD CONSTRAINT \`FK_183b4b4f99dc3ee5d28c5f8c5f0\` FOREIGN KEY (\`attribute_id\`) REFERENCES \`attributes\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`order_items\` ADD CONSTRAINT \`FK_145532db85752b29c57d2b7b1f1\` FOREIGN KEY (\`order_id\`) REFERENCES \`orders\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`fcm_tokens\` ADD CONSTRAINT \`FK_9fd867cabc75028a5625ce7b24c\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`categories\` ADD CONSTRAINT \`FK_88cea2dc9c31951d06437879b40\` FOREIGN KEY (\`parent_id\`) REFERENCES \`categories\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`categories\` DROP FOREIGN KEY \`FK_88cea2dc9c31951d06437879b40\``);
        await queryRunner.query(`ALTER TABLE \`fcm_tokens\` DROP FOREIGN KEY \`FK_9fd867cabc75028a5625ce7b24c\``);
        await queryRunner.query(`ALTER TABLE \`order_items\` DROP FOREIGN KEY \`FK_145532db85752b29c57d2b7b1f1\``);
        await queryRunner.query(`ALTER TABLE \`product_attributes\` DROP FOREIGN KEY \`FK_183b4b4f99dc3ee5d28c5f8c5f0\``);
        await queryRunner.query(`ALTER TABLE \`product_attributes\` DROP FOREIGN KEY \`FK_f5a6700abd0494bae3032cf5bbd\``);
        await queryRunner.query(`ALTER TABLE \`attributes\` DROP FOREIGN KEY \`FK_0702649871193d82dcd49ee358d\``);
        await queryRunner.query(`DROP TABLE \`audit_logs\``);
        await queryRunner.query(`DROP TABLE \`notifications\``);
        await queryRunner.query(`DROP TABLE \`categories\``);
        await queryRunner.query(`DROP TABLE \`inventory\``);
        await queryRunner.query(`DROP TABLE \`fcm_tokens\``);
        await queryRunner.query(`DROP TABLE \`order_items\``);
        await queryRunner.query(`DROP INDEX \`IDX_563d34322942aeff0ca2a4b472\` ON \`orders\``);
        await queryRunner.query(`DROP TABLE \`orders\``);
        await queryRunner.query(`DROP TABLE \`product_attributes\``);
        await queryRunner.query(`DROP TABLE \`attributes\``);
        await queryRunner.query(`DROP TABLE \`products\``);
        await queryRunner.query(`DROP TABLE \`settings\``);
        await queryRunner.query(`DROP INDEX \`IDX_a000cca60bcf04454e72769949\` ON \`users\``);
        await queryRunner.query(`DROP TABLE \`users\``);
    }

}
