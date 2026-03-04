import crypto from "crypto";
import { parse } from "csv-parse";
import { stringify } from "csv-stringify";
import { Pool } from "pg";
import { from as copyFrom } from "pg-copy-streams";
import { Transform,  } from "stream";
import { pipeline } from "stream/promises";
import { BatchPayload } from "@/generated/prisma/internal/prismaNamespace";
import { CreateCustomerInput, Customer } from "../types/models";
import { CustomerRepository } from "../repositories/customerRepository";
import { parseCSV } from "@/utils/parseCSV";
import logger from "@/utils/logger";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export class CustomerService {
  /**
   * Import customers from CSV file
   * Options:
   * - batchSize: number of records per DB batch (default 5000)
   */
  static async importFromCSV(
    fileContent: string,
    options?: {
      batchSize?: number;
    },
  ): Promise<BatchPayload> {
    const batchSize = options?.batchSize ?? 5000;

    const rows = parseCSV(fileContent);

    const normalizePhone = (p?: string | null) =>
      p ? p.toString().replace(/\D+/g, "").trim() || null : null;

    const isValidEmail = (e?: string) =>
      Boolean(e && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));

    const customersAccumulator: CreateCustomerInput[] = [];

    for (const row of rows) {
      const rawCustomerId = (row["Customer Id"] ?? row["CustomerId"] ?? "")
        .toString()
        .trim();
      const emailRaw = (row["Email"] ?? "").toString().trim().toLowerCase();
      const firstName = (row["First Name"] ?? row["firstName"] ?? "")
        .toString()
        .trim();
      const lastName = (row["Last Name"] ?? row["lastName"] ?? "")
        .toString()
        .trim();

      const subDateRaw =
        row["Subscription Date"] ?? row["subscriptionDate"] ?? "";
      const parsed = subDateRaw ? new Date(subDateRaw) : null;
      const subscriptionDate =
        parsed && !isNaN(parsed.getTime()) ? parsed : null;

      const customer: CreateCustomerInput = {
        customerId:
          rawCustomerId ||
          (emailRaw ? `email:${emailRaw}` : crypto.randomUUID()),
        firstName,
        lastName,
        company: (row["Company"] ?? "").toString().trim(),
        city: (row["City"] ?? "").toString().trim(),
        country: (row["Country"] ?? "").toString().trim(),
        phone1: normalizePhone(row["Phone 1"] ?? row["Phone1"]) ?? "",
        phone2: normalizePhone(row["Phone 2"] ?? null),
        email: isValidEmail(emailRaw) ? emailRaw : "",
        subscriptionDate,
        website: (row["Website"] ?? null) as string | null,
      };
      customersAccumulator.push(customer);

    }

    const enrichedCustomers: CreateCustomerInput[] = [];
    for (let i = 0; i < customersAccumulator.length; i += batchSize) {
      const batch = customersAccumulator.slice(i, i + batchSize);
      enrichedCustomers.push(...batch);
    }

    // final safety defaults
    const finalCustomers = enrichedCustomers.map((c) => {
      if (!c.customerId) c.customerId = crypto.randomUUID();
      if (!c.firstName && !c.lastName) c.firstName = "Unknown";
      return c;
    });

    let totalInserted = 0;
    for (let i = 0; i < finalCustomers.length; i += batchSize) {
      const batch = finalCustomers.slice(i, i + batchSize);
      try {
        const result = await CustomerRepository.bulkCreate(batch);
        totalInserted += result?.count ?? 0;
      } catch (err) {
        logger.error("Bulk insert failed for a batch", { error: String(err) });
      }
    }

    logger.info("CSV import metrics", {
      inputRows: rows.length,
      processed: finalCustomers.length,
      inserted: totalInserted,
      batchSize,
    });

    return { count: totalInserted } as BatchPayload;
  }

  /**
   * Import customers from CSV stream
   * Options:
   */
  static async importFromCSVStream(
    fileStream: NodeJS.ReadableStream,
  ): Promise<void> {
    const client = await pool.connect();

    try {
      const dbWriteStream = client.query(
        copyFrom(`COPY "fileuploadservice"."Customer" ("customerId", "firstName", "lastName", "company", "city", "country", "phone1", "phone2", "email", "subscriptionDate", "website") FROM STDIN WITH (FORMAT csv);`),
      );
      // const now = new Date().toISOString();
      const dataTransformer = new Transform({
        objectMode: true,
        transform(row, encoding, callback) {
          try {
            const rawCustomerId = (
              row["Customer Id"] ??
              row["CustomerId"] ??
              ""
            ).trim();
            const emailRaw = (row["Email"] ?? "").trim().toLowerCase();
            const isValidEmail = Boolean(
              emailRaw && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailRaw),
            );

            const normalizePhone = (p?: string) =>
              p ? p.replace(/\D+/g, "").trim() || null : null;

            const subDateRaw =
              row["Subscription Date"] ?? row["subscriptionDate"] ?? "";
            const parsed = subDateRaw ? new Date(subDateRaw) : null;
            const subscriptionDate =
              parsed && !isNaN(parsed.getTime()) ? parsed.toISOString() : null;

            const transformedRow = [
              rawCustomerId ||
                (emailRaw ? `email:${emailRaw}` : crypto.randomUUID()),
              (row["First Name"] ?? "").trim(),
              (row["Last Name"] ?? "").trim(),
              (row["Company"] ?? "").trim(),
              (row["City"] ?? "").trim(),
              (row["Country"] ?? "").trim(),
              normalizePhone(row["Phone 1"]),
              normalizePhone(row["Phone 2"]),
              isValidEmail ? emailRaw : null,
              subscriptionDate,
              row["Website"] ?? null,
              // now,
              // now
            ];

            callback(null, transformedRow);
          } catch (error: unknown) {
            callback(error as Error);
          }
        },
      });

      try{
        await pipeline(
          fileStream,
          parse({ columns: true, trim: true }),
          dataTransformer,
          stringify(), 
          dbWriteStream
        );

      }finally{
        client.release();
      }
      
    } catch (error) {
      logger.error("Error during CSV stream import", { error: String(error) });
      throw error;
    } 
  }



  /**
   * Create a new customer
   */
  static async create(data: CreateCustomerInput): Promise<Customer> {
    return await CustomerRepository.create(data);
  }

  /**
   * Get customer by ID
   */
  static async findById(id: number): Promise<Customer | null> {
    return await CustomerRepository.findById(id);
  }

  /**
   * Get all customers with pagination
   */
  static async findAll(
    skip: number = 0,
    take: number = 10,
  ): Promise<{ customers: Customer[]; total: number }> {
    return await CustomerRepository.findAll(skip, take);
  }

  /**
   * Update customer record
   */
  static async update(
    id: number,
    data: Partial<CreateCustomerInput>,
  ): Promise<Customer | null> {
    return await CustomerRepository.update(id, data);
  }

  /**
   * Delete customer record
   */
  static async delete(id: number): Promise<boolean> {
    return await CustomerRepository.delete(id);
  }

  /**
   * Get customer count
   */
  static async count(): Promise<number> {
    return await CustomerRepository.count();
  }
}
