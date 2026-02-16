/**
 * Base Application Error class
 * All application errors should extend this
 */

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  timestamp: Date;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date();

    // Set the prototype explicitly
    Object.setPrototypeOf(this, AppError.prototype);

    Error.captureStackTrace(this, this.constructor);
  }
}
