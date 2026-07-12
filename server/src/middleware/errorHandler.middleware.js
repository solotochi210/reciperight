const ApiError = require('../utils/ApiError');

/** 404 handler for unmatched routes. */
function notFoundHandler(req, res, next) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

/**
 * Central error handler. Normalizes ApiError, Mongoose, and JWT errors
 * into a consistent JSON envelope. Logs the stack in development.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let errors = err.errors || null;

  // Mongoose validation
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    errors = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `Duplicate value for ${field}`;
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // JWT
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  const isDev = process.env.NODE_ENV !== 'production';
  // 404s are expected for unknown paths — don't spam the console with stacks
  if (statusCode === 404) {
    if (isDev) console.warn(`[404] ${req.method} ${req.originalUrl}`);
  } else if (isDev || statusCode >= 500) {
    console.error(`[error] ${statusCode} ${message}`);
    if (err.stack) console.error(err.stack);
  }

  const body = {
    success: false,
    message,
  };
  if (errors) body.errors = errors;
  if (isDev) body.stack = err.stack;

  res.status(statusCode).json(body);
}

module.exports = { errorHandler, notFoundHandler };
