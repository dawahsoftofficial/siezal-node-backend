import { IsNotEmpty, IsPhoneNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
    @ApiProperty({
        example: '+923001234567',
        description: 'Registered phone number to send OTP for password reset',
    })
    @IsNotEmpty({ message: 'Phone number is required' })
    @IsPhoneNumber('PK', { message: 'Must be a valid Pakistani phone number' })
    phone: string;
}
