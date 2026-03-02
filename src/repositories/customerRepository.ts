/**
 * File Repository
 * Data access layer for file operations
 */

import { BatchPayload } from "@/generated/prisma/internal/prismaNamespace.js";
import prisma from "../config/database.js";
import { CreateCustomerInput, Customer } from "../types/models.js";

export class CustomerRepository {
  /**
   * Create a new file record
   */
  static async create(data: CreateCustomerInput): Promise<Customer> {
    return prisma.customer.create({
      data,
    });
  }

  /**
   * Bulk create customers
   */
  static async bulkCreate(data: CreateCustomerInput[]): Promise<BatchPayload> {
    return prisma.customer.createMany({
      data,
      skipDuplicates: true,
    });
  } 
  
  /**
   * Find file by ID
   */
  static async findById(id: number): Promise<Customer | null> {
    return prisma.customer.findUnique({
      where: { id },
    });
  }



  /**
   * Get all files with pagination
   */
  static async findAll(
    skip: number = 0,
    take: number = 10
  ): Promise<{ customers: Customer[]; total: number }> {
    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        skip,
        take,
      }),
      prisma.file.count(),
    ]);

    return { customers, total };
  }

  /**
   * Update file record
   */
  static async update(
    id: number,
    data: Partial<CreateCustomerInput>
  ): Promise<Customer | null> {
    try {
      return await prisma.customer.update({
        where: { id },
        data,
      });
    } catch (error) {
      return null;
    }
  }

  /**
   * Delete file record
   */
  static async delete(id: number): Promise<boolean> {
    try {
      await prisma.customer.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }



  /**
   * Get file count
   */
  static async count(): Promise<number> {
    return prisma.customer.count();
  }


}
