import { NestFactory, Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { CustomValidationPipe } from './common/pipes/validation.pipe';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    snapshot: process.env.NODE_ENV !== 'production',
  });

  const configService = app.get(ConfigService);
  const reflector = app.get(Reflector);

  const appName = configService.get<string>('app.appName', 'AI Tools Directory');
  const port = configService.get<number>('app.port', 3000);
  const apiPrefix = configService.get<string>('app.apiPrefix', 'api/v1');
  const corsOrigins = configService.get<string[]>('app.corsOrigins', ['http://localhost:5173']);
  const nodeEnv = configService.get<string>('app.nodeEnv', 'development');

  app.setGlobalPrefix(apiPrefix, {
    exclude: ['health', 'health/ready', 'health/live'],
  });

  // Trust proxy for correct IP detection behind reverse proxies
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https:", "http:"],
        styleSrc: ["'self'", "'unsafe-inline'", "https:", "http:"],
        imgSrc: ["'self'", "data:", "https:", "http:", "blob:"],
        connectSrc: ["'self'", "https:", "http:"],
        fontSrc: ["'self'", "https:", "http:"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    strictTransportSecurity: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  }));

  app.use(compression());

  const cookieSecret = configService.get<string>('app.cookieSecret');
  if (!cookieSecret) throw new Error('COOKIE_SECRET environment variable is required');
  app.use(cookieParser(cookieSecret));

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || corsOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['Set-Cookie', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
    maxAge: 86400,
  });

  app.useGlobalPipes(
    new CustomValidationPipe(),
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  app.useGlobalInterceptors(new TransformInterceptor(reflector));

  if (nodeEnv !== 'production' || process.env.ENABLE_SWAGGER === 'true') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle(appName)
      .setDescription('API documentation for the AI Tools Directory platform')
      .setVersion('1.0')
      .setContact('Support Team', 'https://aitoolsdirectory.com/support', 'support@aitoolsdirectory.com')
      .setLicense('MIT', 'https://opensource.org/licenses/MIT')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      .addApiKey(
        {
          type: 'apiKey',
          name: 'x-api-key',
          in: 'header',
          description: 'API key for programmatic access',
        },
        'ApiKey-auth',
      )
      .addCookieAuth('refreshToken')
      .addServer(
        nodeEnv === 'production'
          ? configService.get<string>('app.appUrl', 'https://api.aitoolsdirectory.com')
          : `http://localhost:${port}`,
      )
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'method',
        docExpansion: 'list',
        filter: true,
        showRequestDuration: true,
      },
      customSiteTitle: `${appName} - API Docs`,
      customfavicon: '/favicon.ico',
      customCss: '.swagger-ui .topbar { display: none }',
    });

    logger.log(`Swagger docs available at /api/docs`);
  }

  app.enableShutdownHooks();

  await app.listen(port, '0.0.0.0');
  logger.log(`Application is running on http://localhost:${port}/${apiPrefix}`);
  logger.log(`Environment: ${nodeEnv}`);
}

bootstrap().catch((err) => {
  console.error('BOOTSTRAP FAILED:', err);
  Logger.error('Failed to start application', err, 'Bootstrap');
  process.exit(1);
});
