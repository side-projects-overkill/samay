// backend/src/config/data-source.ts
// TypeORM data source configuration for migrations

import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL || 'postgres://samay:samay@localhost:5432/samay',
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
});

