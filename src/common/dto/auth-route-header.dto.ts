import { IsNotEmpty, IsString } from "class-validator";
import { CommonHeaderDto } from "./common-header.dto";

export class AuthenticatedHeaderDto extends CommonHeaderDto {
    @IsNotEmpty({ message: 'authorization is required' })
    @IsString()
    authorization: string;
  }