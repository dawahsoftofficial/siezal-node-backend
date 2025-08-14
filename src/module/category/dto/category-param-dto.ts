import { Type } from "class-transformer";
import { IsString } from "class-validator";

export class CategorySlugParamDto {
  @Type(() => String)
  @IsString()
  slug: string;
}
