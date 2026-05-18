import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class UpdateProductImageDto {
  @ApiProperty({ example: "https://example.com/product.jpg" })
  @IsString()
  image: string;
}
