import { ConfigService } from '@nestjs/config';
import { Global, Module } from '@nestjs/common';
import { JwtModule as NestJwtModule } from '@nestjs/jwt';
import { JwtService } from './jwt.service';

@Global()
@Module({
  imports: [
    NestJwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.get('JWT_ACCESS_SECRET'),
          signOptions: { expiresIn: '15m' },
        };
      },
    }),
  ],
  providers: [JwtService],
  exports: [JwtService], // ✅ Export so it's available globally
})
export class JwtCustomModule {}
