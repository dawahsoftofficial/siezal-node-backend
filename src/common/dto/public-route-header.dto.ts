import { IsNotEmpty, IsString, ValidateIf } from "class-validator";
import { CommonHeaderDto } from "./common-header.dto";

export class PublicRouteHeaderDto extends CommonHeaderDto {
    @IsNotEmpty({ message: 'payload is required' })
    @IsString()
    payload: string; //hash of the random string
  }