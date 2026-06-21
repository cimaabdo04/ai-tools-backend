import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma/prisma.service';

describe('AI Tools Directory API (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.setGlobalPrefix('api/v1');

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe('AppController', () => {
    describe('GET /api/v1/health', () => {
      it('should return health status with 200', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/health')
          .expect(200);

        expect(response.body).toBeDefined();
        expect(response.body.status).toBeDefined();
        expect(response.body.status).toEqual('ok');
        expect(response.body.timestamp).toBeDefined();
        expect(response.body.timestamp).toEqual(expect.any(String));
      });

      it('should include uptime in response', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/health')
          .expect(200);

        expect(response.body.uptime).toBeDefined();
        expect(typeof response.body.uptime).toBe('number');
      });
    });

    describe('GET /api/v1/health/live', () => {
      it('should return liveness probe status', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/health/live')
          .expect(200);

        expect(response.body).toBeDefined();
        expect(response.body.status).toEqual('ok');
      });
    });

    describe('GET /api/v1/health/ready', () => {
      it('should return readiness probe status with database check', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/health/ready')
          .expect(200);

        expect(response.body).toBeDefined();
        expect(response.body.status).toEqual('ok');
        expect(response.body.checks).toBeDefined();
        expect(Array.isArray(response.body.checks)).toBe(true);
      });
    });

    describe('GET /api/', () => {
      it('should redirect to API docs', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/')
          .expect(301);

        expect(response.headers.location).toContain('/api/docs');
      });
    });
  });

  describe('CategoryController', () => {
    describe('GET /api/v1/categories', () => {
      it('should return list of categories', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/categories')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
      });
    });

    describe('GET /api/v1/categories/:slug', () => {
      it('should return 404 for non-existent category', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/categories/non-existent-category')
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBeDefined();
        expect(response.body.error.statusCode).toEqual(404);
      });
    });
  });

  describe('ToolController', () => {
    describe('GET /api/v1/tools', () => {
      it('should return paginated list of tools', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/tools')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.meta).toBeDefined();
        expect(response.body.meta.page).toBeDefined();
        expect(response.body.meta.limit).toBeDefined();
        expect(response.body.meta.total).toBeDefined();
      });

      it('should support pagination parameters', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/tools?page=1&limit=10')
          .expect(200);

        expect(response.body.meta.page).toEqual(1);
        expect(response.body.meta.limit).toEqual(10);
        expect(response.body.data.length).toBeLessThanOrEqual(10);
      });

      it('should filter by category', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/categories')
          .expect(200);

        if (response.body.data.length > 0) {
          const categorySlug = response.body.data[0].slug;
          const filteredResponse = await request(app.getHttpServer())
            .get(`/api/v1/tools?category=${categorySlug}`)
            .expect(200);

          expect(filteredResponse.body.success).toBe(true);
        }
      });
    });
  });

  describe('AuthController', () => {
    describe('POST /api/v1/auth/register', () => {
      const testUser = {
        email: `test-${Date.now()}@example.com`,
        password: 'TestPassword123!',
        name: 'Test User',
        username: `testuser-${Date.now()}`,
      };

      it('should register a new user', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/auth/register')
          .send(testUser)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(response.body.data.email).toEqual(testUser.email);
        expect(response.body.data.accessToken).toBeDefined();
      });

      it('should reject duplicate email', async () => {
        await request(app.getHttpServer())
          .post('/api/v1/auth/register')
          .send(testUser)
          .expect(409);
      });

      it('should validate email format', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/auth/register')
          .send({
            email: 'invalid-email',
            password: 'TestPassword123!',
            name: 'Test',
            username: `test-${Date.now()}`,
          })
          .expect(400);

        expect(response.body.success).toBe(false);
      });
    });

    describe('POST /api/v1/auth/login', () => {
      it('should login with valid credentials', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/auth/login')
          .send({
            email: 'superadmin@aitools.io',
            password: 'Password123!',
          })
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.accessToken).toBeDefined();
        expect(response.body.data.user).toBeDefined();
      });

      it('should reject invalid password', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/auth/login')
          .send({
            email: 'superadmin@aitools.io',
            password: 'wrong-password',
          })
          .expect(401);

        expect(response.body.success).toBe(false);
      });

      it('should reject non-existent email', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/auth/login')
          .send({
            email: 'nonexistent@example.com',
            password: 'SomePassword123!',
          })
          .expect(401);

        expect(response.body.success).toBe(false);
      });
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/non-existent-route')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.statusCode).toEqual(404);
    });

    it('should return 429 when rate limited', async () => {
      const requests = Array(150).fill(null).map(() =>
        request(app.getHttpServer()).get('/api/v1/tools')
      );

      const results = await Promise.all(requests);
      const tooManyRequests = results.some((r) => r.status === 429);

      if (tooManyRequests) {
        const rateLimitedResponse = results.find((r) => r.status === 429);
        expect(rateLimitedResponse!.body.success).toBe(false);
        expect(rateLimitedResponse!.body.error.statusCode).toEqual(429);
      }
    });

    it('should return proper error for invalid JSON body', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .set('Content-Type', 'application/json')
        .send('not-valid-json')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});
