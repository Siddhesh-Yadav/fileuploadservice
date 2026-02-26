import { Router } from "express";

import { uploadSingleFile, handleUploadError } from "../middlewares/fileUpload.js";
import { createCustomerNoStream } from "@/controllers/customerController.js";
/**
 * POST /api/files
 * Upload a new file
 */

const router = Router();
router.post("/no-stream", uploadSingleFile, handleUploadError, createCustomerNoStream);

export default router;