// src/database/utils/init-database.util.ts
import { ConfigService } from '@nestjs/config';
import * as mysql from 'mysql2/promise';

export const ensureDatabaseExists = async (configService: ConfigService) => {
  const host = configService.get<string>('DB_HOST');
  const port = Number(configService.get<string>('DB_PORT'));
  const user = configService.get<string>('DB_USERNAME');
  const pass = configService.get<string>('DB_PASSWORD');
  const dbName = configService.get<string>('DB_MAIN_NAME');

  const connection = await mysql.createConnection({
    host,
    port,
    user,
    password: pass,
  });

  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
  await connection.end();
};
