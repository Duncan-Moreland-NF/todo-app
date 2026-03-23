import { Router } from 'express';
import { getAllTodos, createTodo, updateTodo, deleteTodo } from '../db/queries.js';
import {
  validateCreateTodo,
  validateTodoId,
  validateUpdateTodo,
} from '../middleware/validation.js';

const router = Router();

// GET /api/todos — fetch all todos sorted newest first
router.get('/', async (_req, res, next) => {
  try {
    const todos = await getAllTodos();
    res.json(todos);
  } catch (err) {
    next(err);
  }
});

// POST /api/todos — create a new todo
router.post('/', validateCreateTodo, async (req, res, next) => {
  try {
    const todo = await createTodo(req.body.title);
    res.status(201).json(todo);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/todos/:id — toggle completed status
router.patch('/:id', validateTodoId, validateUpdateTodo, async (req, res, next) => {
  try {
    const todo = await updateTodo(req.params.id, req.body.completed);
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    res.json(todo);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/todos/:id — delete a todo
router.delete('/:id', validateTodoId, async (req, res, next) => {
  try {
    const deleted = await deleteTodo(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
