import { PartialType } from "@nestjs/swagger";
import { CreateVendorProductDto } from "./vendor-product.dto";

export class UpdateVendorProductDto extends PartialType(CreateVendorProductDto) {}
