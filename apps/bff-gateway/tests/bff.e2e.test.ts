import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';

describe('BFF Gateway (e2e)', () => {
  let app: INestApplication;
  let jwt: JwtService;

  beforeAll(async () => {
    process.env['JWT_SECRET'] ??= 'dev-only-replace-in-prod-change-me-now';
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication({ logger: false });
    await app.init();
    jwt = moduleRef.get(JwtService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/v1/public/ping → 200 + { ok: true }', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/public/ping').expect(200);
    expect(res.body).toEqual({ ok: true });
  });

  it('GET /api/v1/admin/ping 无 JWT → 401', async () => {
    await request(app.getHttpServer()).get('/api/v1/admin/ping').expect(401);
  });

  it('GET /api/v1/admin/ping 带 admin JWT → 200', async () => {
    const token = jwt.sign({ sub: 'u-1', roles: ['portal-admin'], type: 'access' });
    const res = await request(app.getHttpServer())
      .get('/api/v1/admin/ping')
      .set('authorization', `Bearer ${token}`)
      .expect(200);
    expect(res.body).toEqual({ ok: true, scope: 'admin' });
  });

  it('GET /api/v1/admin/ping 带普通校友 JWT → 403', async () => {
    const token = jwt.sign({ sub: 'u-2', roles: ['readonly'], type: 'access' });
    await request(app.getHttpServer())
      .get('/api/v1/admin/ping')
      .set('authorization', `Bearer ${token}`)
      .expect(403);
  });

  it('GET /api/v1/alumni/ping 带 readonly JWT → 200', async () => {
    const token = jwt.sign({ sub: 'u-3', roles: ['readonly'], type: 'access' });
    const res = await request(app.getHttpServer())
      .get('/api/v1/alumni/ping')
      .set('authorization', `Bearer ${token}`)
      .expect(200);
    expect(res.body).toEqual({ ok: true, scope: 'alumni' });
  });
});
