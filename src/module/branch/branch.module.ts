import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Branch } from "src/database/entities/branch.entity";
import { AdminBranchController } from "./controller/branch-admin.controller";
import { BranchController } from "./controller/branch.controller";
import { BranchService } from "./branch.service";

@Module({
  imports: [TypeOrmModule.forFeature([Branch])],
  controllers: [AdminBranchController, BranchController],
  providers: [BranchService],
  exports: [BranchService],
})
export class BranchModule {}
