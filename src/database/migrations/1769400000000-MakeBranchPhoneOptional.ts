import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeBranchPhoneOptional1769400000000
  implements MigrationInterface
{
  name = "MakeBranchPhoneOptional1769400000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `branches` MODIFY `phone` varchar(50) NULL",
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `branches` MODIFY `phone` varchar(50) NOT NULL",
    );
  }
}
