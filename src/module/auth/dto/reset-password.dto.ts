import { IsNotEmpty, IsPhoneNumber, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
    @ApiProperty({
        example: '+923001234567',
        description: 'Phone number used to receive OTP',
    })
    @IsNotEmpty({ message: 'Phone number is required' })
    @IsPhoneNumber('PK', { message: 'Must be a valid Pakistani phone number' })
    phone: string;

    @ApiProperty({
        example: '123456',
        description: 'OTP sent to the phone',
    })
    @IsNotEmpty({ message: 'OTP is required' })
    otp: string;

    @ApiProperty({
        example: 'NewStrongPassword!',
        description: 'New password to set (minimum 5 characters)',
    })
    @IsNotEmpty({ message: 'New password is required' })
    @MinLength(5, { message: 'Password must be at least 5 characters long' })
    newPassword: string;
}
