import { AppError } from "../utils/customError.js";

// Specific Error Handlers
const handleCastErrorDb = err => new AppError(`Invalid ${err.path}: ${err.value}`, 400);

const handleDuplicateFieldsDb = err => {
  /*
  console.log("here maybe");
  const value = err.errmsg?.match(/(["'])(\\?.)*?/)?.[0] || 'Duplicate';
  return new AppError(`Duplicate field value: ${value}. Please use another value!`, 400);
  */
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  return new AppError(`Duplicate field "${field}": "${value}". Please use another value!`, 400);
};

const handleValidationErrorDb = err => {
  console.log("here i guess")
  const errors = Object.values(err.errors).map(el => el.message);
  return new AppError(`Invalid input data: ${errors.join('. ')}`, 400);
};

const handleJWTError = () => new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () => new AppError('Your token has expired. Please log in again!', 401);

// Dev Error Response
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    success: false,
    error: {
      status: err.status,
      code: err.code || 'UNKNOWN_ERROR',
      message: err.message,
      stack: err.stack,
      details: err.details || []
    }
  });
};

// Prod Error Response
const sendErrorProd = (err, req, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code || 'OPERATIONAL_ERROR',
        message: err.message,
        details: err.details || []
      }
    });
  } else {
    console.error('ERROR 💥', err);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Something went wrong!'
      }
    });
  }
};

// Global Error Middleware
const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = err;
    error.message = err.message;

    if (error.name === 'CastError') error = handleCastErrorDb(error);
    if (error.code === 11000) error = handleDuplicateFieldsDb(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDb(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  }
};

// Async Wrapper for Routes
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

export {
  catchAsync,
  globalErrorHandler
};
