import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { getDatabaseConfig } from "./core/config/database.config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule, ConfigService } from "@nestjs/config";
import firebaseConfig from "./core/config/firebase.config";
import { JwtCustomModule } from "./shared/jwt/jwt.module";
import { EDBConnectionName } from "./common/enums/app.enum";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { HelperModule } from "./common/helpers/helper.module";
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { JwtAuthGuard } from "./common/guards/jwt-auth.guard";
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter";
import { ValidatedHeadersInterceptor } from "./common/interceptors/validated-header.interceptor";
import { LoggingInterceptor } from "./common/interceptors/logging.interceptor";
import { AuditLogModule } from "./module/audit-log/audit-log.module";
import { ensureDatabaseExists } from "./common/utils/init-database.util";
import { AuthModule } from "./module/auth/auth.module";
import { RedisModule } from "./shared/redis/redis.module";
import { ProductModule } from "./module/product/product.module";
import { CategoryModule } from "./module/category/category.module";
import { InventoryModule } from "./module/inventory/inventory.module";
import { OrderModule } from "./module/order/order.module";
import { SettingModule } from "./module/setting/setting.module";
import { DashboardModule } from "./module/dashboard/dashboard.module";
import { AwsModule } from "./shared/aws/aws.module";
import { TwilioModule } from "./shared/twilio/twilio.module";
import { TwilioService } from "./shared/twilio/twilio.service";
import { FirebaseModule } from "./shared/firebase/firebase.module";
import { FcmTokenModule } from "./module/fcm-token/fcm-token.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
      load: [firebaseConfig],
    }),
    JwtCustomModule,
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          ttl: configService.getOrThrow<number>("THROTTLE_TIME_TO_LIVE"), // Time window in milliseconds
          limit: configService.getOrThrow<number>("THROTTLE_LIMIT"), // Maximum number of requests per IP within the time window
        },
      ],
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        await ensureDatabaseExists(configService); // ✅ Ensure DB exists before connecting
        return {
          ...getDatabaseConfig(EDBConnectionName.MAIN, configService),
        };
      },
    }),

    AuditLogModule,
    AuthModule,
    HelperModule,
    RedisModule,
    ProductModule,
    CategoryModule,
    InventoryModule,
    OrderModule,
    SettingModule,
    DashboardModule,
    AwsModule,
    TwilioModule,
    FirebaseModule,
    FcmTokenModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ValidatedHeadersInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter, // Register the exception filter globally
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, //add this if you wwant to apply this all guard where you want cutom then add UseGurdad and if you dont want then add NoGuard
    },
  ],
})
export class AppModule {}
