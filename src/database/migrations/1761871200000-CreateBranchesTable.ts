import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateBranchesTable1761871200000 implements MigrationInterface {
  name = "CreateBranchesTable1761871200000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "CREATE TABLE `branches` (`id` int NOT NULL AUTO_INCREMENT, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `name` varchar(150) NOT NULL, `address` varchar(255) NOT NULL, `latitude` double NOT NULL, `longitude` double NOT NULL, `phone` varchar(50) NOT NULL, `email` varchar(255) NULL, `is_active` tinyint NOT NULL DEFAULT 1, `deleted_at` datetime NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB",
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("DROP TABLE `branches`");
  }
}
