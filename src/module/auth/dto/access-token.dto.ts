import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AccessTokenDto {
  @ApiProperty({
    example: 'refresh-token',
    description: 'enryted refresh token.',
  })
  @IsNotEmpty()
  @IsString()
  public readonly refreshToken: string;
}
