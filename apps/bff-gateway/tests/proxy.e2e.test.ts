/**
 * Proxy forwarding e2e：
 * 启动 fake upstream server + NestJS BFF，
 * 验证 public/alumni/admin/webhook catch-all 路由透传行为。
 */
import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import type { INestApplication } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';
import request from 'supertest';
import { AuthJwtModule } from '../src/auth/jwt.module.js';
import { RbacGuard } from '../src/auth/rbac.guard.js';
import { AdminController } from '../src/controllers/admin.controller.js';
import { AlumniController } from '../src/controllers/alumni.controller.js';
import { PublicController, WebhookController } from '../src/controllers/public.controller.js';
import { ProblemDetailsFilter } from '../src/filters/problem-details.filter.js';
import { ForwardService } from '../src/proxy/forward.service.js';

/** fake upstream: echoes method + url + headers as JSON */
function createFakeUpstream(): http.Server {
  return http.createServer((req, res) => {
    const chunks: Buffer[] = [];
    req.on('data', (c: Buffer) => chunks.push(c));
    req.on('end', () => {
      const body = Buffer.concat(chunks).toString('utf8');
      res.writeHead(200, { 'content-type': 'application/json', 'x-upstream': 'yes' });
      res.end(
        JSON.stringify({
          method: req.method,
          url: req.url,
          traceId: req.headers['x-trace-id'] ?? null,
          authUserId: req.headers['x-auth-user-id'] ?? null,
          bodyEcho: body || null,
        }),
      );
    });
  });
}

describe('Proxy forward (e2e)', () => {
  let upstream: http.Server;
  let app: INestApplication;
  let jwt: JwtService;

  beforeAll(async () => {
    // 1) start fake upstream
    upstream = createFakeUpstream();
    await new Promise<void>((r) => upstream.listen(0, '127.0.0.1', r));
    const upstreamPort = (upstream.address() as AddressInfo).port;

    // 2) Build a custom module with HttpModule pointing to fake upstream
    process.env['JWT_SECRET'] ??= 'dev-only-replace-in-prod-change-me-now';

    const moduleRef = await Test.createTestingModule({
      imports: [
        HttpModule.register({
          baseURL: `http://127.0.0.1:${upstreamPort}`,
          timeout: 10_000,
          maxRedirects: 0,
        }),
        AuthJwtModule,
      ],
      controllers: [PublicController, WebhookController, AdminController, AlumniController],
      providers: [
        { provide: APP_FILTER, useClass: ProblemDetailsFilter },
        ForwardService,
        RbacGuard,
      ],
    }).compile();
    app = moduleRef.createNestApplication({ logger: false });
    await app.init();
    jwt = moduleRef.get(JwtService);
  });

  afterAll(async () => {
    delete process.env['UPSTREAM_SERVER_URL'];
    await app?.close();
    await new Promise<void>((r) => upstream?.close(() => r()));
  });

  /* ---- public routes ---- */
  it('GET /api/v1/public/ping → 原生 200（不透传）', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/public/ping').expect(200);
    expect(res.body).toEqual({ ok: true });
  });

  it('GET /api/v1/public/news → 透传到 upstream', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/public/news?page=1').expect(200);
    expect(res.body.url).toBe('/api/v1/public/news?page=1');
    expect(res.body.method).toBe('GET');
    expect(res.body.traceId).toBeTruthy();
    expect(res.headers['x-upstream']).toBe('yes');
  });

  it('POST /api/v1/public/feedback → 透传 body', async () => {
    const payload = { msg: 'hello' };
    const res = await request(app.getHttpServer())
      .post('/api/v1/public/feedback')
      .send(payload)
      .expect(200);
    expect(JSON.parse(res.body.bodyEcho)).toEqual(payload);
  });

  /* ---- webhook ---- */
  it('POST /api/v1/webhook/payment → 透传（无 JWT）', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/webhook/payment')
      .send({ event: 'paid' })
      .expect(200);
    expect(res.body.url).toBe('/api/v1/webhook/payment');
    expect(res.body.authUserId).toBeNull();
  });

  /* ---- alumni routes ---- */
  it('GET /api/v1/alumni/profile 无 JWT → 401', async () => {
    await request(app.getHttpServer()).get('/api/v1/alumni/profile').expect(401);
  });

  it('GET /api/v1/alumni/profile 带 JWT → 透传 + x-auth-user-id', async () => {
    const token = jwt.sign({ sub: 'u-100', roles: ['readonly'], type: 'access' });
    const res = await request(app.getHttpServer())
      .get('/api/v1/alumni/profile')
      .set('authorization', `Bearer ${token}`);
    if (res.status !== 200) {
      console.error('alumni proxy response:', res.status, JSON.stringify(res.body));
    }
    expect(res.status).toBe(200);
    expect(res.body.url).toBe('/api/v1/alumni/profile');
    expect(res.body.authUserId).toBe('u-100');
    expect(res.body.traceId).toBeTruthy();
  });

  /* ---- admin routes ---- */
  it('GET /api/v1/admin/users 无 JWT → 401', async () => {
    await request(app.getHttpServer()).get('/api/v1/admin/users').expect(401);
  });

  it('GET /api/v1/admin/users readonly → 403', async () => {
    const token = jwt.sign({ sub: 'u-200', roles: ['readonly'], type: 'access' });
    await request(app.getHttpServer())
      .get('/api/v1/admin/users')
      .set('authorization', `Bearer ${token}`)
      .expect(403);
  });

  it('GET /api/v1/admin/users admin JWT → 透传', async () => {
    const token = jwt.sign({ sub: 'u-201', roles: ['portal-admin'], type: 'access' });
    const res = await request(app.getHttpServer())
      .get('/api/v1/admin/users')
      .set('authorization', `Bearer ${token}`);
    if (res.status !== 200) {
      console.error('admin proxy response:', res.status, JSON.stringify(res.body));
    }
    expect(res.status).toBe(200);
    expect(res.body.url).toBe('/api/v1/admin/users');
    expect(res.body.authUserId).toBe('u-201');
  });
});
