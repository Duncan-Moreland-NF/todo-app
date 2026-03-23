import { describe, it, expect, vi } from 'vitest';
import {
  validateCreateTodo,
  validateTodoId,
  validateUpdateTodo,
} from '../../src/middleware/validation.js';

/**
 * Helper: create mock req / res / next for Express middleware testing.
 */
function createMocks({ body = {}, params = {} } = {}) {
  const req = { body, params };
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  const next = vi.fn();
  return { req, res, next };
}

// --- validateCreateTodo ---

describe('validateCreateTodo', () => {
  it('passes valid title through and calls next', () => {
    const { req, res, next } = createMocks({ body: { title: 'Buy milk' } });
    validateCreateTodo(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('trims whitespace from title', () => {
    const { req, res, next } = createMocks({ body: { title: '  Buy milk  ' } });
    validateCreateTodo(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.body.title).toBe('Buy milk');
  });

  it('rejects missing title', () => {
    const { req, res, next } = createMocks({ body: {} });
    validateCreateTodo(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Title is required and must be between 1 and 255 characters',
    });
  });

  it('rejects empty string title', () => {
    const { req, res, next } = createMocks({ body: { title: '' } });
    validateCreateTodo(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('rejects whitespace-only title', () => {
    const { req, res, next } = createMocks({ body: { title: '   ' } });
    validateCreateTodo(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('rejects non-string title (number)', () => {
    const { req, res, next } = createMocks({ body: { title: 123 } });
    validateCreateTodo(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('rejects non-string title (boolean)', () => {
    const { req, res, next } = createMocks({ body: { title: true } });
    validateCreateTodo(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('rejects non-string title (null)', () => {
    const { req, res, next } = createMocks({ body: { title: null } });
    validateCreateTodo(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('rejects title exceeding 255 characters', () => {
    const { req, res, next } = createMocks({ body: { title: 'a'.repeat(256) } });
    validateCreateTodo(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('accepts title of exactly 255 characters', () => {
    const { req, res, next } = createMocks({ body: { title: 'a'.repeat(255) } });
    validateCreateTodo(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});

// --- validateTodoId ---

describe('validateTodoId', () => {
  it('passes valid positive integer id', () => {
    const { req, res, next } = createMocks({ params: { id: '1' } });
    validateTodoId(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.params.id).toBe(1);
  });

  it('rejects non-integer id', () => {
    const { req, res, next } = createMocks({ params: { id: 'abc' } });
    validateTodoId(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'ID must be a valid positive integer',
    });
  });

  it('rejects zero id', () => {
    const { req, res, next } = createMocks({ params: { id: '0' } });
    validateTodoId(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('rejects negative id', () => {
    const { req, res, next } = createMocks({ params: { id: '-1' } });
    validateTodoId(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('rejects float id', () => {
    const { req, res, next } = createMocks({ params: { id: '1.5' } });
    validateTodoId(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });
});

// --- validateUpdateTodo ---

describe('validateUpdateTodo', () => {
  it('passes when completed is true', () => {
    const { req, res, next } = createMocks({ body: { completed: true } });
    validateUpdateTodo(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('passes when completed is false', () => {
    const { req, res, next } = createMocks({ body: { completed: false } });
    validateUpdateTodo(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('rejects missing completed', () => {
    const { req, res, next } = createMocks({ body: {} });
    validateUpdateTodo(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Completed must be a boolean',
    });
  });

  it('rejects non-boolean completed (string)', () => {
    const { req, res, next } = createMocks({ body: { completed: 'true' } });
    validateUpdateTodo(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('rejects non-boolean completed (number)', () => {
    const { req, res, next } = createMocks({ body: { completed: 1 } });
    validateUpdateTodo(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });
});
