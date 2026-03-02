import { Request, Response } from "express";
import fs from "fs";
import { CustomerService } from "../services/customerService.js";
import { FileService } from "../services/fileService.js";
import { sendSuccessResponse } from "../utils/responseFormatter.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import logger from "@/utils/logger.js";
import Busboy from "busboy";
import { BatchPayload } from "@/generated/prisma/internal/prismaNamespace.js";

/**
 * Create customers from CSV file without using streams.
 * POST /api/customers-nostreams
 */
export const createCustomerNoStream = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.file) {
      throw new Error("No file provided");
    }

    const start = performance.now();

    const fileWithUrl = await FileService.uploadFile(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );
    
    const fileBuffer = await fs.promises.readFile(fileWithUrl.storagePath);

    const batchSize = Number(req.query.batchSize ?? 5000);
    const dedupeWithinFile = (req.query.dedupe === "true");

    const result = await CustomerService.importFromCSV(fileBuffer.toString(), {
      batchSize,
      dedupe: dedupeWithinFile,
    });

    const end = performance.now();
    const used = process.memoryUsage();

    console.table({
      'Execution Time (s)': (end - start) / 1000,
      'Heap Used (MB)': Math.round(used.heapUsed / 1024 / 1024),
      'RSS (Total Process RAM MB)': Math.round(used.rss / 1024 / 1024)
    });
    
    sendSuccessResponse(
      res,
      { count: result.count },
      "Customers imported successfully",
      201
    );
  }
);

/**
 * Create customers from CSV file  using streams.
 * POST /api/customers-streams
 */
export const createCustomerWithStreams = asyncHandler(
  async (req: Request, res: Response) => {
    const start = performance.now();
    const bb = Busboy({ headers: req.headers });
    let processing : Promise<void> | null = null;

    bb.on("file", (_fieldname: string, fileStream: NodeJS.ReadableStream) => {
      const batchSize  = Number(req.query.batchSize ?? 5000);

      processing = CustomerService.importFromCSVStream(fileStream, {
        batchSize,
      });
    });

    bb.on("finish", async () => {
      if (!processing) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const result = await processing;
      const end = performance.now();
      const used = process.memoryUsage();
  
      console.table({
        'Execution Time (s)': (end - start) / 1000,
        'Heap Used (MB)': Math.round(used.heapUsed / 1024 / 1024),
        'RSS (Total Process RAM MB)': Math.round(used.rss / 1024 / 1024)
      });
      sendSuccessResponse(
        res,
        { count: result },
        "Customers imported successfully",
        201
      );
    });

    req.pipe(bb);
  }
);