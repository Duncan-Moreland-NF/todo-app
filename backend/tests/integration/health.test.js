import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

// Mock the pool module before importing app
vi.mock('../../src/db/pool.js', () => {
  return {
    default: {
      query: vi.fn(),
    },
  };
});

// Import after mock is set up
const { default: pool } = await import('../../src/db/pool.js');
const { default: app } = await import('../../src/app.js');

describe('GET /api/health', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 200 with status ok when database is connected', async () => {
    pool.query.mockResolvedValue({ rows: [{ '?column?': 1 }] });

    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok', database: 'connected' });
  });

  it('returns 503 with status error when database is unreachable', async () => {
    pool.query.mockRejectedValue(new Error('Connection refused'));

    const res = await request(app).get('/api/health');

    expect(res.status).toBe(503);
    expect(res.body).toEqual({ status: 'error', database: 'disconnected' });
  });
});
