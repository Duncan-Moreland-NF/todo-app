import pool from './pool.js';

/**
 * Fetch all todos, sorted newest first.
 * @returns {Promise<Array>} Array of todo objects
 */
export async function getAllTodos() {
  const { rows } = await pool.query(
    'SELECT id, title, completed, created_at FROM todos ORDER BY created_at DESC',
  );
  return rows;
}

/**
 * Create a new todo.
 * @param {string} title — the todo title (already trimmed)
 * @returns {Promise<Object>} The created todo row
 */
export async function createTodo(title) {
  const { rows } = await pool.query(
    'INSERT INTO todos (title) VALUES ($1) RETURNING id, title, completed, created_at',
    [title],
  );
  return rows[0];
}

/**
 * Update a todo's completed status.
 * @param {number} id
 * @param {boolean} completed
 * @returns {Promise<Object|null>} The updated todo, or null if not found
 */
export async function updateTodo(id, completed) {
  const { rows } = await pool.query(
    'UPDATE todos SET completed = $1 WHERE id = $2 RETURNING id, title, completed, created_at',
    [completed, id],
  );
  return rows[0] || null;
}

/**
 * Delete a todo by id.
 * @param {number} id
 * @returns {Promise<Object|null>} The deleted row's id, or null if not found
 */
export async function deleteTodo(id) {
  const { rows } = await pool.query(
    'DELETE FROM todos WHERE id = $1 RETURNING id',
    [id],
  );
  return rows[0] || null;
}
