import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/ai_tools_directory',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'ai_tools_directory',
  ssl: process.env.DB_SSL === 'true',
  logging: process.env.DB_LOGGING === 'true',
}));
