import { MigrationInterface, QueryRunner } from "typeorm";

export class IconsOptionalCategory1759215116591 implements MigrationInterface {
    name = 'IconsOptionalCategory1759215116591'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`categories\` CHANGE \`icon\` \`icon\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`categories\` CHANGE \`icon\` \`icon\` varchar(255) NOT NULL`);
    }

}
