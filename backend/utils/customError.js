class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}


class ValidationError extends AppError {
  constructor(message, details = []) {
    super(message, 400);
    this.code = 'VALIDATION_ERROR';
    this.details = details;
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentication fail') {
    super(message, 401);
    this.code = 'Authentication_Error';
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'Access denied') {
    super(message, 403);
    this.code = 'Authorization_Error';
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
    this.code = 'NOT_FOUND_ERROR'
  }
}

class DatabaseError extends AppError {
  constructor(message = 'Database operation failed') {
    super(message, 500);
    this.code = 'Database_Error';
  }
}

class RateLimiterError extends AppError{
  constructor(message='Too many requests'){
    super(message,429);
    this.code='RATE_LIMIT_ERROR';
  }
}

export{
  ValidationError,
  NotFoundError,
  DatabaseError,
  RateLimiterError,
  AuthenticationError,
  AuthorizationError,
  AppError
}