import { PartialType } from "@nestjs/swagger";
import { CreateProductBodyDto } from "./product-create.dto";

export class UpdateProductBodyDto extends PartialType(CreateProductBodyDto) {}
