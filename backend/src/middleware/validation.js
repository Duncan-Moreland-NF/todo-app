/**
 * Validate the request body for creating a todo.
 * Title must be a non-empty string between 1 and 255 characters after trimming.
 */
export function validateCreateTodo(req, res, next) {
  const { title } = req.body;

  if (
    title === undefined ||
    title === null ||
    typeof title !== 'string' ||
    title.trim().length === 0 ||
    title.trim().length > 255
  ) {
    return res.status(400).json({
      error: 'Title is required and must be between 1 and 255 characters',
    });
  }

  // Store trimmed title back on the body for downstream use
  req.body.title = title.trim();
  next();
}

/**
 * Validate that :id param is a positive integer.
 */
export function validateTodoId(req, res, next) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'ID must be a valid positive integer' });
  }

  req.params.id = id;
  next();
}

/**
 * Validate the request body for updating a todo.
 * Completed must be a boolean.
 */
export function validateUpdateTodo(req, res, next) {
  const { completed } = req.body;

  if (typeof completed !== 'boolean') {
    return res.status(400).json({ error: 'Completed must be a boolean' });
  }

  next();
}
