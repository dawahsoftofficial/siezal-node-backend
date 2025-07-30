import { IsBoolean, IsEmail, IsNotEmpty, IsPhoneNumber, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyOtpDto {
    @ApiProperty({
        example: '+923001234567',
        description: 'Registered phone number where OTP was sent',
    })
    @IsNotEmpty({ message: 'Phone number is required' })
    @IsPhoneNumber('PK', { message: 'Must be a valid Pakistani phone number' })
    phone: string;

    @ApiProperty({
        example: '123456',
        description: '6-digit OTP sent to phone',
    })
    @IsNotEmpty({ message: 'OTP is required' })
    @IsString()
    @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
    otp: string;

    @ApiProperty({
        example: true,
        description: 'Flag to indicate if this is for forgot password flow',
        required: false,
    })
    @IsEmail()
    @IsBoolean({ message: 'Forgot password flag must be a boolean' })
    forgotPassword?: boolean;
}
