import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  apiPrefix: 'api/v1',
  appName: process.env.APP_NAME || 'AI Tools Directory',
  appUrl: process.env.APP_URL || 'http://localhost:3000',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  corsOrigins: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',')
    : ['http://localhost:5173', 'http://localhost:3000'],
  logLevel: process.env.LOG_LEVEL || 'debug',
  cookieSecret: process.env.COOKIE_SECRET || 'super-secret-cookie',
}));
