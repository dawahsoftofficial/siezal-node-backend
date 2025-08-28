import {
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  MinLength,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ResetPasswordDto {
  @ApiProperty({
    example: "reset-password-token",
    description: "Sent reset password token",
  })
  @IsNotEmpty({ message: "Reset Password Token is required" })
  @IsString()
  resetPasswordToken: string; // This should be the token sent to the user's email or phone

  @ApiProperty({
    example: "NewStrongPassword!",
    description: "New password to set (minimum 5 characters)",
  })
  @IsNotEmpty({ message: "New password is required" })
  @IsString()
  @MinLength(5, { message: "Password must be at least 5 characters long" })
  newPassword: string;
}
