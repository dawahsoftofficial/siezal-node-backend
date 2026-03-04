import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtModule } from "@nestjs/jwt";
import { Branch } from "src/database/entities/branch.entity";
import { Category } from "src/database/entities/category.entity";
import { Product } from "src/database/entities/product.entity";
import { Vendor } from "src/database/entities/vendor.entity";
import { VendorLog } from "src/database/entities/vendor-log.entity";
import { VendorAdminController } from "./controller/vendor-admin.controller";
import { VendorIntegrationController } from "./controller/vendor-integration.controller";
import { VendorAuthGuard } from "./guard/vendor-auth.guard";
import { VendorService } from "./vendor.service";
import { ProductModule } from "../product/product.module";
import { BranchModule } from "../branch/branch.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Vendor, VendorLog, Product, Category, Branch]),
    JwtModule,
    ProductModule,
    BranchModule,
  ],
  controllers: [VendorAdminController, VendorIntegrationController],
  providers: [VendorService, VendorAuthGuard],
  exports: [VendorService],
})
export class VendorModule {}
