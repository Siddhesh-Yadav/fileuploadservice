import { CreateCustomerInput,Customer } from '../types/models';
import { CustomerRepository } from '../repositories/customerRepository';
import { parseCSV } from '@/utils/parseCSV';
import { BatchPayload } from '@/generated/prisma/internal/prismaNamespace';
import logger from '@/utils/logger';
import crypto from 'crypto';

export class CustomerService {
   /**
   * Import customers from CSV file
   *
   * Options:
   * - batchSize: number of records per DB batch (default 5000)
   * - dedupe: boolean to dedupe records within the uploaded file (default false)
   */
  static async importFromCSV(
    fileContent: string,
    options?: {
      batchSize?: number;
      dedupe?: boolean;
    }
  ): Promise<BatchPayload> {
    const batchSize = options?.batchSize ?? 5000;
    const dedupeWithinFile = options?.dedupe ?? false;

    const rows = parseCSV(fileContent);

    const normalizePhone = (p?: string | null) =>
      p ? p.toString().replace(/\D+/g, "").trim() || null : null;

    const isValidEmail = (e?: string) =>
      Boolean(e && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));

    const dedupeMap = new Map<string, CreateCustomerInput>();

    const customersAccumulator: CreateCustomerInput[] = [];

    for (const row of rows) {
      const rawCustomerId = (row["Customer Id"] ?? row["CustomerId"] ?? "").toString().trim();
      const emailRaw = (row["Email"] ?? "").toString().trim().toLowerCase();
      const firstName = (row["First Name"] ?? row["firstName"] ?? "").toString().trim();
      const lastName = (row["Last Name"] ?? row["lastName"] ?? "").toString().trim();

      const subDateRaw = row["Subscription Date"] ?? row["subscriptionDate"] ?? "";
      const parsed = subDateRaw ? new Date(subDateRaw) : null;
      const subscriptionDate = parsed && !isNaN(parsed.getTime()) ? parsed : null;

      const customer: CreateCustomerInput = {
        customerId: rawCustomerId || (emailRaw ? `email:${emailRaw}` : crypto.randomUUID()),
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

      if (dedupeWithinFile) {
        const key = rawCustomerId || (customer.email ? `email:${customer.email}` : crypto.randomUUID());
        if (!dedupeMap.has(key)) {
          dedupeMap.set(key, customer);
          customersAccumulator.push(customer);
        }
      } else {
        customersAccumulator.push(customer);
      }
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
        totalInserted += (result?.count ?? 0);
      } catch (err) {
        logger.error("Bulk insert failed for a batch", { error: String(err) });
      }
    }

    logger.info("CSV import metrics", {
      inputRows: rows.length,
      processed: finalCustomers.length,
      inserted: totalInserted,
      batchSize,
      dedupeWithinFile,
    });

    return { count: totalInserted } as BatchPayload;
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
    take: number = 10
  ): Promise<{ customers: Customer[]; total: number }> {
    return await CustomerRepository.findAll(skip, take);
  }

  /**
   * Update customer record
   */
  static async update(
    id: number,
    data: Partial<CreateCustomerInput>
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
// ...existing code...