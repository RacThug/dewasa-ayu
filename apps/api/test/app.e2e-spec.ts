import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { AppModule } from '../src/app.module';

let app: INestApplication;
let http: ReturnType<typeof request>;

beforeAll(async () => {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  app = moduleRef.createNestApplication();
  app.setGlobalPrefix('api/v1');
  await app.init();
  http = request(app.getHttpServer());
});

afterAll(async () => {
  await app.close();
});

describe('meta + health', () => {
  it('GET /health → engine version + uptime', async () => {
    const res = await http.get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(typeof res.body.engineVersion).toBe('string');
  });

  it('GET /ceremonies → the six ceremonies', async () => {
    const res = await http.get('/api/v1/ceremonies');
    expect(res.status).toBe(200);
    expect(res.body.ceremonies).toHaveLength(6);
    expect(res.body.ceremonies[0]).toEqual({ id: 'pawiwahan', name: 'Pawiwahan (Pernikahan)' });
  });

  it('GET /dewasa?ceremony=pitra_yadnya → includes Semut Sadulur, all unverified', async () => {
    const res = await http.get('/api/v1/dewasa?ceremony=pitra_yadnya');
    expect(res.status).toBe(200);
    expect(res.body.rules.some((r: { id: string }) => r.id === 'semut_sadulur')).toBe(true);
    expect(res.body.rules.every((r: { verified: boolean }) => r.verified === false)).toBe(true);
  });
});

describe('calendar/check', () => {
  it('returns the full breakdown + verdict (Galungan 2026, pawiwahan)', async () => {
    const res = await http.get('/api/v1/calendar/check?date=2026-06-17&ceremony=pawiwahan');
    expect(res.status).toBe(200);
    expect(res.body.info.wuku).toBe('dungulan');
    expect(res.body.info.gregorian).toBe('2026-06-17T00:00:00.000Z');
    expect(res.body.evaluation.ceremony).toBe('pawiwahan');
    expect(['ayu', 'caution', 'bad']).toContain(res.body.evaluation.rating);
    expect(res.body.evaluation.estimated).toBe(true);
  });

  it('400 envelope on an unknown ceremony', async () => {
    const res = await http.get('/api/v1/calendar/check?date=2026-06-17&ceremony=wedding');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(typeof res.body.error.code).toBe('string');
  });

  it('400 envelope on a malformed date', async () => {
    const res = await http.get('/api/v1/calendar/check?date=2026-6-17&ceremony=usaha');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_PARAM');
  });

  it('400 OUT_OF_RANGE past the supported Sasih range', async () => {
    const res = await http.get('/api/v1/calendar/check?date=2102-01-01&ceremony=usaha');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('OUT_OF_RANGE');
  });
});

describe('calendar/month, recommend, range', () => {
  it('GET /calendar/month → one entry per day (Feb 2026 = 28)', async () => {
    const res = await http.get('/api/v1/calendar/month?year=2026&month=2&ceremony=dewa_yadnya');
    expect(res.status).toBe(200);
    expect(res.body.days).toHaveLength(28);
    const { ayuCount, cautionCount, badCount } = res.body.summary;
    expect(ayuCount + cautionCount + badCount).toBe(28);
    expect(res.body.summary.topDates.length).toBeLessThanOrEqual(5);
  });

  it('GET /calendar/recommend → ayu dates only, capped at count', async () => {
    const res = await http.get('/api/v1/calendar/recommend?from=2026-01-01&count=3&ceremony=usaha');
    expect(res.status).toBe(200);
    expect(res.body.dates.length).toBeLessThanOrEqual(3);
    expect(
      res.body.dates.every(
        (d: { evaluation: { rating: string } }) => d.evaluation.rating === 'ayu',
      ),
    ).toBe(true);
  });

  it('GET /calendar/range → every day in the range', async () => {
    const res = await http.get(
      '/api/v1/calendar/range?from=2026-01-01&to=2026-01-05&ceremony=usaha',
    );
    expect(res.status).toBe(200);
    expect(res.body.dates).toHaveLength(5);
  });

  it('400 when the range exceeds 90 days', async () => {
    const res = await http.get(
      '/api/v1/calendar/range?from=2026-01-01&to=2026-06-01&ceremony=usaha',
    );
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
