import 'dotenv/config'; // ✅ Load .env at the top
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { getDatabaseConfig } from '../config/database.config';
import { EDBConnectionName } from 'src/common/enums/app.enum';

const configService = new ConfigService();

// npm run migration:generate src/database/migrations/<migrato name>
const config = {

  ...getDatabaseConfig(EDBConnectionName.MAIN, configService),

  migrations: ['src/database/migrations/*.ts'],
  entities: ['src/database/entities/*.ts'],
  logger: 'advanced-console', // remove custom logger for CLI

  
} as any;

export const AppDataSource = new DataSource(config);
