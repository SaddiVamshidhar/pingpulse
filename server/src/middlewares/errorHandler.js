// Centralised error handler - converts every error into a consistent JSON response.
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid id: ${err.value}`;
  }

  if (statusCode === 500) console.error(err);
  res.status(statusCode).json({ success: false, message });
};

export default errorHandler;
