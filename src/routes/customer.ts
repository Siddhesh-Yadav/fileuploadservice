import { Router } from "express";

import { uploadSingleFile, handleUploadError } from "../middlewares/fileUpload.js";
import { createCustomerNoStream , createCustomerWithStreams} from "@/controllers/customerController.js";
/**
 * POST /api/files
 * Upload a new file
 */

const router = Router();
router.post("/no-stream", uploadSingleFile, handleUploadError, createCustomerNoStream);
router.post("/stream", createCustomerWithStreams);

export default router;