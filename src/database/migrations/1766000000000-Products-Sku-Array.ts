import { MigrationInterface, QueryRunner } from "typeorm";

export class ProductsSkuArray1766000000000 implements MigrationInterface {
    name = 'ProductsSkuArray1766000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`products\` ADD \`sku_temp\` json NULL`);
        await queryRunner.query(
            `UPDATE \`products\` SET \`sku_temp\` = CASE 
                WHEN \`sku\` IS NULL OR \`sku\` = '' THEN NULL 
                ELSE JSON_ARRAY(\`sku\`) 
            END`
        );
        await queryRunner.query(`ALTER TABLE \`products\` DROP COLUMN \`sku\``);
        await queryRunner.query(`ALTER TABLE \`products\` CHANGE \`sku_temp\` \`sku\` json NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`products\` ADD \`sku_temp\` varchar(100) NULL`);
        await queryRunner.query(
            `UPDATE \`products\` SET \`sku_temp\` = 
                CASE 
                    WHEN JSON_VALID(\`sku\`) THEN JSON_UNQUOTE(JSON_EXTRACT(\`sku\`, '$[0]')) 
                    ELSE NULL 
                END`
        );
        await queryRunner.query(`ALTER TABLE \`products\` DROP COLUMN \`sku\``);
        await queryRunner.query(`ALTER TABLE \`products\` CHANGE \`sku_temp\` \`sku\` varchar(100) NULL`);
    }

}
