import { PartialType } from "@nestjs/swagger";
import { CreateProductBodyDto } from "./product-create.dto";
import { Allow } from "class-validator";

export class UpdateProductBodyDto extends CreateProductBodyDto {
  @Allow()
  image?: any;
}
