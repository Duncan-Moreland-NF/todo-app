import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('pool', () => {
  let originalEnv;

  beforeEach(() => {
    originalEnv = process.env.DATABASE_URL;
    // Reset module cache so pool.js is re-evaluated
    vi.resetModules();
  });

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.DATABASE_URL = originalEnv;
    } else {
      delete process.env.DATABASE_URL;
    }
  });

  it('uses DATABASE_URL environment variable when set', async () => {
    const mockPool = vi.fn();
    vi.doMock('pg', () => ({
      default: { Pool: mockPool },
    }));

    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/testdb';

    await import('../../src/db/pool.js');

    expect(mockPool).toHaveBeenCalledWith({
      connectionString: 'postgresql://test:test@localhost:5432/testdb',
    });
  });

  it('uses fallback connection string when DATABASE_URL is not set', async () => {
    const mockPool = vi.fn();
    vi.doMock('pg', () => ({
      default: { Pool: mockPool },
    }));

    delete process.env.DATABASE_URL;

    await import('../../src/db/pool.js');

    expect(mockPool).toHaveBeenCalledWith({
      connectionString:
        'postgresql://postgres:postgres@localhost:5432/todoapp',
    });
  });
});
