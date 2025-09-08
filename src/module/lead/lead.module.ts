import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CategoryModule } from "../category/category.module";
import { ProductModule } from "../product/product.module";
import { Lead } from "src/database/entities/lead.entity";
import { LeadController } from "./controller/lead.controller";
import { LeadService } from "./lead.service";
@Module({
  imports: [TypeOrmModule.forFeature([Lead]), CategoryModule, ProductModule],
  controllers: [LeadController],
  providers: [LeadService],
  exports: [LeadService],
})
export class LeadModule {}
