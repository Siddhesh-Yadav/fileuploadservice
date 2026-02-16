/**
 * File Upload Error
 * Used specifically for file upload operation failures
 */

import { AppError } from "./AppError.js";
import { HTTP_STATUS } from "../config/constants.js";

export class FileUploadError extends AppError {
  constructor(message: string) {
    super(message, HTTP_STATUS.UNPROCESSABLE_ENTITY, true);

    Object.setPrototypeOf(this, FileUploadError.prototype);
  }
}
