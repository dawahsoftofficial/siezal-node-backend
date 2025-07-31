import { IsNotEmpty, IsString, IsEmail, MinLength, IsPhoneNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
    @ApiProperty({
        example: '+923001234567',
        description: 'Registered phone number where OTP was sent',
    })
    @IsNotEmpty({ message: 'Phone number is required' })
    @IsPhoneNumber('PK', { message: 'Must be a valid Pakistani phone number' })
    phone: string;

  @ApiProperty({
    example: 'StrongPassword123!',
    description: 'Password must be a non-empty string.',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(5, { message: 'Password must be at least 5 characters long' })
  public readonly password: string;
}
