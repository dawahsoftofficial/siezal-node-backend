import { IsNotEmpty, IsString, IsEmail, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginAdminDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Valid email address of the user.',
  })
  @IsNotEmpty()
  @IsEmail({}, { message: 'Email must be a valid email address' })
  public readonly email: string;

  @ApiProperty({
    example: 'StrongPassword123!',
    description: 'Password must be a non-empty string.',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(5, { message: 'Password must be at least 5 characters long' })
  public readonly password: string;
}
