import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { ConfigService } from "@nestjs/config";
import { EDBConnectionName } from "src/common/enums/app.enum";
import { QueryLogger } from "../loggers/query.logger";

// Function to generate DB config for different databases
export const getDatabaseConfig = (
  connectionName: EDBConnectionName,
  configService: ConfigService
): TypeOrmModuleOptions => {
  const connectionObj: Record<EDBConnectionName, TypeOrmModuleOptions> = {
    [EDBConnectionName.MAIN]: {
      type: "mysql",
      host: configService.get<string>("DB_HOST"),
      port: Number(configService.get<number | string>("DB_PORT")),
      username: configService.get<string>("DB_USERNAME"),
      password: configService.get<string>("DB_PASSWORD"),
      database: configService.get<string>("DB_MAIN_NAME"),
      autoLoadEntities: true,
      synchronize: false,
      timezone: "+05:00",
      logging: true,
      // subscribers: [BaseSubscriber],
      logger: new QueryLogger(),
    },
  };

  return connectionObj[connectionName];
};
