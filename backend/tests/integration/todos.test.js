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

const { default: pool } = await import('../../src/db/pool.js');
const { default: app } = await import('../../src/app.js');

describe('GET /api/todos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns empty array when no todos exist', async () => {
    pool.query.mockResolvedValue({ rows: [] });

    const res = await request(app).get('/api/todos');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns all todos sorted newest first', async () => {
    const mockTodos = [
      {
        id: 2,
        title: 'Second todo',
        completed: false,
        created_at: '2026-03-23T12:00:00.000Z',
      },
      {
        id: 1,
        title: 'First todo',
        completed: true,
        created_at: '2026-03-23T11:00:00.000Z',
      },
    ];
    pool.query.mockResolvedValue({ rows: mockTodos });

    const res = await request(app).get('/api/todos');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockTodos);
    expect(res.body).toHaveLength(2);
    expect(res.body[0].id).toBe(2);
    expect(res.body[1].id).toBe(1);
  });

  it('returns each todo with correct shape', async () => {
    const mockTodos = [
      {
        id: 1,
        title: 'Buy milk',
        completed: false,
        created_at: '2026-03-23T10:00:00.000Z',
      },
    ];
    pool.query.mockResolvedValue({ rows: mockTodos });

    const res = await request(app).get('/api/todos');

    expect(res.status).toBe(200);
    const todo = res.body[0];
    expect(todo).toHaveProperty('id');
    expect(todo).toHaveProperty('title');
    expect(todo).toHaveProperty('completed');
    expect(todo).toHaveProperty('created_at');
  });

  it('returns 500 on database failure', async () => {
    pool.query.mockRejectedValue(new Error('DB connection failed'));

    const res = await request(app).get('/api/todos');

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
  });
});

describe('POST /api/todos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a todo and returns 201 with correct shape', async () => {
    const createdTodo = {
      id: 1,
      title: 'Buy milk',
      completed: false,
      created_at: '2026-03-23T10:00:00.000Z',
    };
    pool.query.mockResolvedValue({ rows: [createdTodo] });

    const res = await request(app)
      .post('/api/todos')
      .send({ title: 'Buy milk' });

    expect(res.status).toBe(201);
    expect(res.body).toEqual(createdTodo);
    expect(res.body.completed).toBe(false);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('created_at');
  });

  it('trims whitespace from title before storing', async () => {
    const createdTodo = {
      id: 1,
      title: 'Buy milk',
      completed: false,
      created_at: '2026-03-23T10:00:00.000Z',
    };
    pool.query.mockResolvedValue({ rows: [createdTodo] });

    await request(app).post('/api/todos').send({ title: '  Buy milk  ' });

    expect(pool.query).toHaveBeenCalledWith(expect.any(String), ['Buy milk']);
  });

  it('returns 400 when title is missing', async () => {
    const res = await request(app).post('/api/todos').send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toBe(
      'Title is required and must be between 1 and 255 characters',
    );
  });

  it('returns 400 when title is empty string', async () => {
    const res = await request(app).post('/api/todos').send({ title: '' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe(
      'Title is required and must be between 1 and 255 characters',
    );
  });

  it('returns 400 when title is whitespace only', async () => {
    const res = await request(app).post('/api/todos').send({ title: '   ' });

    expect(res.status).toBe(400);
  });

  it('returns 400 when title is not a string', async () => {
    const res = await request(app).post('/api/todos').send({ title: 123 });

    expect(res.status).toBe(400);
  });

  it('returns 400 when title exceeds 255 characters', async () => {
    const res = await request(app)
      .post('/api/todos')
      .send({ title: 'a'.repeat(256) });

    expect(res.status).toBe(400);
  });

  it('returns 500 on database failure', async () => {
    pool.query.mockRejectedValue(new Error('DB write failed'));

    const res = await request(app)
      .post('/api/todos')
      .send({ title: 'Buy milk' });

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
  });
});

describe('PATCH /api/todos/:id', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('toggles todo to completed and returns 200', async () => {
    const updatedTodo = {
      id: 1,
      title: 'Buy milk',
      completed: true,
      created_at: '2026-03-23T10:00:00.000Z',
    };
    pool.query.mockResolvedValue({ rows: [updatedTodo] });

    const res = await request(app)
      .patch('/api/todos/1')
      .send({ completed: true });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(updatedTodo);
    expect(res.body.completed).toBe(true);
  });

  it('toggles todo back to incomplete and returns 200', async () => {
    const updatedTodo = {
      id: 1,
      title: 'Buy milk',
      completed: false,
      created_at: '2026-03-23T10:00:00.000Z',
    };
    pool.query.mockResolvedValue({ rows: [updatedTodo] });

    const res = await request(app)
      .patch('/api/todos/1')
      .send({ completed: false });

    expect(res.status).toBe(200);
    expect(res.body.completed).toBe(false);
  });

  it('returns 404 for non-existent id', async () => {
    pool.query.mockResolvedValue({ rows: [] });

    const res = await request(app)
      .patch('/api/todos/999')
      .send({ completed: true });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Todo not found' });
  });

  it('returns 400 when completed is missing', async () => {
    const res = await request(app).patch('/api/todos/1').send({});

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Completed must be a boolean' });
  });

  it('returns 400 when completed is not a boolean', async () => {
    const res = await request(app)
      .patch('/api/todos/1')
      .send({ completed: 'true' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Completed must be a boolean' });
  });

  it('returns 400 when id is not a valid positive integer', async () => {
    const res = await request(app)
      .patch('/api/todos/abc')
      .send({ completed: true });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'ID must be a valid positive integer' });
  });
});

describe('DELETE /api/todos/:id', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deletes a todo and returns 204', async () => {
    pool.query.mockResolvedValue({ rows: [{ id: 1 }] });

    const res = await request(app).delete('/api/todos/1');

    expect(res.status).toBe(204);
    expect(res.body).toEqual({});
  });

  it('returns 404 for non-existent id', async () => {
    pool.query.mockResolvedValue({ rows: [] });

    const res = await request(app).delete('/api/todos/999');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Todo not found' });
  });

  it('returns 400 for invalid id format', async () => {
    const res = await request(app).delete('/api/todos/abc');

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'ID must be a valid positive integer' });
  });

  it('returns 400 for negative id', async () => {
    const res = await request(app).delete('/api/todos/-1');

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'ID must be a valid positive integer' });
  });
});
