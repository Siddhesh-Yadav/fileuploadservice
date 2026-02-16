/**
 * Not Found Error
 * Used when a resource cannot be found
 */

import { AppError } from "./AppError.js";
import { HTTP_STATUS } from "../config/constants.js";

export class NotFoundError extends AppError {
  constructor(resource: string = "Resource") {
    super(`${resource} not found.`, HTTP_STATUS.NOT_FOUND, true);

    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}
