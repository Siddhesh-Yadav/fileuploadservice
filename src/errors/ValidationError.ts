/**
 * Validation Error
 * Used for input validation failures
 */

import { AppError } from "./AppError.js";
import { HTTP_STATUS } from "../config/constants.js";

export class ValidationError extends AppError {
  details?: Record<string, string[]>;

  constructor(message: string, details?: Record<string, string[]>) {
    super(message, HTTP_STATUS.BAD_REQUEST, true);
    this.details = details;

    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}
