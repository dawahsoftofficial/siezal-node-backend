import { IsNotEmpty, IsOptional, IsString, Validate } from "class-validator";
import { CommonHeaderDto } from "./common-header.dto";
import { GuestAuthConstraint } from "../validators/guest-auth.validator";

export class GuestHeaderDto extends CommonHeaderDto {
  @IsOptional()
  @IsNotEmpty({ message: 'payload is required' })
  @IsString()
  payload?: string;

  @IsOptional()
  @IsNotEmpty({ message: 'authorization is required' })
  @IsString()
  authorization?: string;

  @Validate(GuestAuthConstraint)
  dummyFieldForValidation: string;
}