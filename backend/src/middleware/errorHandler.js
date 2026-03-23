export function errorHandler(err, _req, res, _next) {
  console.error(err.stack);
  const status = err.status || 500;
  const message =
    status === 500 ? 'Internal server error' : err.message || 'Unknown error';
  res.status(status).json({ error: message });
}
