/**
 * Validation Schemas using Joi
 */

import Joi from "joi";
import { LIMITS } from "../config/constants.js";

/**
 * File upload validation schema
 */
export const fileUploadSchema = Joi.object({
  filename: Joi.string().required().max(255),
  mimetype: Joi.string().required(),
  size: Joi.number()
    .required()
    .min(LIMITS.MIN_FILE_SIZE)
    .max(LIMITS.MAX_FILE_SIZE),
}).unknown(true); // Allow additional properties

/**
 * Pagination query validation schema
 */
export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(LIMITS.MAX_LIMIT)
    .default(LIMITS.DEFAULT_LIMIT),
  sortBy: Joi.string().default("uploadedAt"),
  sortOrder: Joi.string().valid("asc", "desc").default("desc"),
});

/**
 * File ID validation schema
 */
export const fileIdSchema = Joi.object({
  id: Joi.string().required(),
});

/**
 * Generic validation function
 */
export const validate = (schema: Joi.Schema, data: any) => {
  const { error, value } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const details: Record<string, string[]> = {};
    error.details.forEach((detail) => {
      const key = detail.path.join(".");
      if (!details[key]) {
        details[key] = [];
      }
      details[key].push(detail.message);
    });
    return { valid: false, error: details, value: null };
  }

  return { valid: true, error: null, value };
};
