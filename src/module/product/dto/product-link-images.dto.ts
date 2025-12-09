import { IsDateString } from "class-validator";

export class ProductLinkImagesQueryDto {
  @IsDateString()
  date: string;
}
